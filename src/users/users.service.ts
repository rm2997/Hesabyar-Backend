import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Not, Repository } from 'typeorm';
import { User } from './users.entity';
import * as bcrypt from 'bcrypt';
import { Roles } from 'src/common/decorators/roles.enum';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { SmsService } from 'src/sms/sms.service';
import { UserRoles } from 'src/common/decorators/roles.decorator';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly smsService: SmsService,
    private configService: ConfigService,
  ) {}

  // یافتن کاربر با نام کاربری
  async findByUsername(username: string): Promise<User | null> {
    const query = this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.userName= :search', { search: `${username}` });
    const user = await query.getOne();
    if (!user) throw new NotFoundException('کاربر مورد نظر شما موجود نیست');

    return user;
  }

  async findAll(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ items: User[]; total: number } | null> {
    const query = this.dataSource
      .getRepository(User)
      .createQueryBuilder('user');

    if (search) {
      query.andWhere('user.userName LIKE :search', { search: `%${search}%` });
    }
    const total = await query.getCount();
    const items = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { total, items };
  }

  async findAllProfiles(
    page: number,
    limit: number,
    search: string,
  ): Promise<{ items: User[]; total: number } | null> {
    const query = this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .select([
        'user.id',
        'user.username',
        'user.userfname',
        'user.userlname',
        'user.role',
      ])
      .where('user.isUserActive=true');

    if (search) {
      query.andWhere('user.userName LIKE :search', { search: `%${search}%` });
    }
    const total = await query.getCount();
    const items = await query
      .skip((page - 1) * limit)
      .take(limit)
      .getMany();

    return { total, items };
  }

  async findById(id: number, selectPass: boolean = false): Promise<User> {
    const query = this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userSentOtpCode', 'otp')
      .where(`user.id=${id}`);
    if (selectPass) query.addSelect('user.password');
    const user = await query.getOne();
    if (!user) throw new NotFoundException(`کاربر مورد نظر موجود نیست`);
    return user;
    // const user = await this.usersRepository.findOne({ where: { id } });
    // if (!user) throw new NotFoundException(`کاربر مورد نظر موجود نیست ${id}`);

    // return { ...user, password: '' };
  }

  async findByMobileNumber(usermobilenumber: string): Promise<any | null> {
    const query = this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userSentOtpCode', 'otp')
      .where(`user.usermobilenumber=${usermobilenumber}`);
    const user = await query.getOne();
    if (!user) throw new NotFoundException(`کاربر مورد نظر موجود نیست`);
    // return user;
    // const user = await this.usersRepository.findOne({
    //   where: { usermobilenumber },
    // });

    if (!user) throw new NotFoundException('Moblie number not found');
    const token = await this.generateUserChangePassToken(user?.id);
    await this.smsService.sendForgetPassSms(user, token);
    return { status: 'success', usermobilenumber: user?.usermobilenumber };
    //return { ...user, password: '', token: token };
  }

  async findByToken(token: string): Promise<User | null> {
    const user = await this.verifyUserChangePassToken(token);
    if (!user) throw new NotFoundException('User not found');
    console.log(user);
    return { ...user, password: '' };
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<User> {
    const query = this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userSentOtpCode', 'otp')
      .where(`user.id=${id}`)
      .andWhere(`user.usermobilenumber=${updateData.usermobilenumber}`)
      .andWhere(`user.id<>${id}`);
    const exist = await query.getOne();
    if (exist)
      throw new BadRequestException('امکان درج موبایل تکراری وجود ندارد');
    const user = await this.findById(id);

    //Object.assign(user, updateData);
    return this.usersRepository.save({ ...user, ...updateData });
  }

  async updateUserLocation(
    user: User,
    location: string,
  ): Promise<any | string> {
    const existingUser = await this.usersRepository.findOne({
      where: { id: user?.id },
    });
    if (!existingUser) return 'کاربر موردنظر در سیستم وجود ندارد';

    if (!location) return 'موقعیت مکانی صحیح نیست';
    console.log('user for set location:', user);

    return this.usersRepository
      .createQueryBuilder()
      .update(User)
      .set({ userLocation: location, lastLogin: new Date() })
      .where('id = :id', { id: user?.id })
      .execute();
    //return await this.usersRepository.update({ id: existingUser.id }, { userLocation: location, lastLogin: new Date() },);
  }

  async sendLocationSms(userId: number): Promise<any | string> {
    const existingUser = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!existingUser) return 'کاربر موردنظر در سیستم وجود ندارد';

    const link = await this.generateUserLocationLink(userId);
    const title = 'درخواست موقعیت مکانی';
    const body =
      'همکار محترم ' +
      existingUser.userfname +
      ' ' +
      existingUser.userlname +
      ' ' +
      'لطفا در اولین فرصت موقعیت خود را از طریق لینک زیر به مجموعه ارسال فرمایید.' +
      '\r\n' +
      link;

    return body;
  }

  async checkPassword(
    id: number,
    password: string,
  ): Promise<{ result: boolean }> {
    const user = await this.usersRepository.findOne({
      where: { id: id },
      select: { password: true },
    });
    if (!user) throw new NotFoundException('کاربر مورد نظر پیدا نشد');
    const result = await this.validatePassword(user.password, password);

    return { result: result };
  }

  async changePasswordFromOut(passwordData: {
    current: string;
    new: string;
    token: string;
  }): Promise<User> {
    const userByToken = await this.verifyUserChangePassToken(
      passwordData.token,
    );
    if (!userByToken) throw new NotFoundException();
    const user = await this.findById(userByToken.id);
    if (!user) throw new NotFoundException();
    let newPass = '';
    if (passwordData.new) {
      const salt = await bcrypt.genSalt();
      newPass = await bcrypt.hash(passwordData.new, salt);
    }
    user.password = newPass;
    const result = this.usersRepository.save(user);
    return { ...result, password: '' };
  }

  async changePass(
    id: number,
    passwordData: { current: string; confirm: string; new: string },
    issuedUser: User,
  ): Promise<User> {
    const user = await this.findById(id, true);
    if (!user) throw new NotFoundException('کاربر موجود نیست');

    const checkPass =
      issuedUser.role == Roles.Admin
        ? true
        : await this.validatePassword(user.password, passwordData.current);

    if (issuedUser.role !== Roles.Admin && !checkPass)
      throw new UnauthorizedException('کلمه عبور جاری صحیح نیست');

    let newPass = '';
    if (passwordData.new) {
      const salt = await bcrypt.genSalt();
      newPass = await bcrypt.hash(passwordData.new, salt);
    }
    user.password = newPass;

    console.log(user);

    return this.usersRepository.save(user);
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.usersRepository.findOne({ where: { id: id } });
    if (!user) throw new NotFoundException('کاربر مورد نظر وجود ندارد');
    try {
      await this.usersRepository.delete(id);
    } catch (error) {
      console.log(error);
      if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.errno === 1451)
        throw new BadRequestException(
          'اطلاعات این کاربر درحال استفاده میباشد، امکان حذف وجود ندارد',
        );
      else
        throw new BadRequestException('خطای داخلی سرور، امکان حذف وجود ندارد');
    }
  }

  async validatePassword(
    hashPassword: string,
    plainPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashPassword);
  }

  async createUser(
    userData: Partial<User>,
    issuedUser: User,
  ): Promise<User | undefined> {
    const exist = await this.usersRepository.findOne({
      where: { usermobilenumber: userData.usermobilenumber },
    });
    if (exist)
      throw new BadRequestException('امکان درج موبایل تکراری وجود ندارد');
    console.log('user password for create is:', userData.password);

    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash(userData.password, salt);
    const newUser = this.usersRepository.create({
      username: userData.username,
      password: password,
      userfname: userData.userfname,
      userlname: userData.userlname,
      usermobilenumber: userData.usermobilenumber,
      role: userData.role,
      twoFactorAuthntication: userData.twoFactorAuthntication,
      createdAt: new Date(),
      createdBy: issuedUser?.id,
    });
    return this.usersRepository.save(newUser);
  }

  async createAdmin() {
    const exists = await this.usersRepository.findOne({
      where: { username: 'admin' },
    });

    if (exists) {
      // return { message: 'Admin already exists' };
      const salt = await bcrypt.genSalt();
      const password = await bcrypt.hash('admin1234', salt);
      exists.password = password;
      await this.usersRepository.save(exists);
      return { message: 'مدیر سیستم به روز رسانی شد' };
    }

    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash('admin1234', salt);

    const admin = this.usersRepository.create({
      username: 'admin',
      password,
      userfname: 'رضا',
      userlname: 'میرعسگری',
      usermobilenumber: '09125213288',
      role: Roles.Admin,
      twoFactorAuthntication: true,
    });

    await this.usersRepository.save(admin);
    return { message: 'مدیر سیستم ساخته شد' };
  }

  async generateUserLocationLink(userId: number) {
    const payload = { userId };
    const secret = this.configService.get('USER_LINK_SECRET');
    const expiresIn = this.configService.get('USER_LINK_EXPIRES_IN');

    const token = jwt.sign(payload, secret, { expiresIn });
    const baseUrl = this.configService.get('FRONT_APP_URL');
    return `${baseUrl}/sendLocationLink/${token}`;
  }

  async verifyUserLocationToken(token: string): Promise<User> {
    try {
      const secret = this.configService.get('USER_LINK_SECRET');
      const payload: any = jwt.verify(token, secret);
      const user = await this.findById(payload.userId);

      if (!user) throw new NotFoundException('کاربر موجود نیست');
      return user;
    } catch (err) {
      throw new UnauthorizedException('لینک نامعتبر یا منقضی‌شده است');
    }
  }

  async generateUserChangePassToken(userId: number) {
    const payload = { userId };
    const secret = this.configService.get('USER_LINK_SECRET');
    const expiresIn = this.configService.get('USER_LINK_EXPIRES_IN');

    const token = jwt.sign(payload, secret, { expiresIn });

    return token;
  }

  async verifyUserChangePassToken(token: string): Promise<User> {
    try {
      const secret = this.configService.get('USER_LINK_SECRET');
      const payload: any = jwt.verify(token, secret);
      const user = await this.findById(payload.userId);

      if (!user) throw new NotFoundException('کاربر موجود نیست');
      return user;
    } catch (err) {
      throw new BadRequestException('لینک نامعتبر یا منقضی‌شده است');
    }
  }

  async getAdminUsers(): Promise<User[]> {
    const admins: User[] = await this.usersRepository.find({
      where: { role: Roles.Admin },
    });

    return admins;
  }

  async getWarehouseUsers(): Promise<User[]> {
    const admins: User[] = await this.usersRepository.find({
      where: { role: Roles.Warehouseman },
    });

    return admins;
  }
}
