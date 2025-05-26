import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import * as bcrypt from 'bcrypt';
import { Roles } from 'src/common/decorators/roles.enum';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private configService: ConfigService,
  ) {}

  // یافتن کاربر با نام کاربری
  async findByUsername(username: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { username } });

    if (!user) throw new NotFoundException('کاربر مورد نظر شما موجود نیست');

    return user;
  }

  // نمایش کل کاربران
  async findAll(): Promise<User[] | null> {
    return this.usersRepository.find();
  }

  // دریافت کاربر با آیدی
  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException(`کاربر مورد نظر موجود نیست ${id}`);

    return { ...user, password: '' };
  }

  async findByMobileNumber(usermobilenumber: string): Promise<User | null> {
    const user = this.usersRepository.findOne({ where: { usermobilenumber } });
    if (!user) throw new NotFoundException('Moblie number not found');
    return user;
  }

  async updateUser(id: number, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);

    if (updateData.password) {
      const salt = await bcrypt.genSalt();
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    Object.assign(user, updateData);
    return this.usersRepository.save(user);
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

  async changePass(
    id: number,
    passwordData: { current: string; new: string },
    issuedUser: User,
  ): Promise<User> {
    const user = await this.findById(id);

    if (
      issuedUser.role === Roles.Admin ||
      (await this.validatePassword(user, passwordData.current))
    ) {
      let newPass = '';
      if (passwordData.new) {
        const salt = await bcrypt.genSalt();
        newPass = await bcrypt.hash(passwordData.new, salt);
      }
      user.password = newPass;
      return this.usersRepository.save(user);
    } else throw new UnauthorizedException('کلمه عبور جاری صحیح نیست');
  }

  // حذف کاربر
  async deleteUser(id: number): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }
  }

  // بررسی صحت رمز عبور
  async validatePassword(user: User, plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, user.password);
  }

  // ایجاد کاربر جدید با هش کردن پسورد
  async createUser(
    userData: Partial<User>,
    issuedUser: User,
  ): Promise<User | undefined> {
    const user = this.usersRepository.create({
      ...userData,
      createdAt: new Date(),
      createdBy: issuedUser?.id,
    });
    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(userData.password, salt);

    return this.usersRepository.save(user);
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
      return { message: 'Admin updated successfully' };
    }

    const salt = await bcrypt.genSalt();
    const password = await bcrypt.hash('admin1234', salt);

    const admin = this.usersRepository.create({
      username: 'admin',
      password,
      userfname: 'reza',
      userlname: 'mirasgari',
      usermobilenumber: '09125213288',
      role: Roles.Admin,
    });

    await this.usersRepository.save(admin);
    return { message: 'Admin created successfully' };
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
      const user = await this.usersRepository.findOne({
        where: { id: payload.userId },
      });

      if (!user) throw new NotFoundException('کاربر موجود نیست');
      return user;
    } catch (err) {
      throw new UnauthorizedException('لینک نامعتبر یا منقضی‌شده است');
    }
  }
}
