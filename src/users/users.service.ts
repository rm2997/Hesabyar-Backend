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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  // یافتن کاربر با نام کاربری
  async findByUsername(username: string): Promise<User | null> {
    const user = await this.usersRepository.findOne({ where: { username } });

    if (!user) throw new NotFoundException('کاربر مورد نظر موجود نیست');

    return user;
  }

  // نمایش کل کاربران
  async findAll(): Promise<User[] | null> {
    return this.usersRepository.find();
  }

  // دریافت کاربر با آیدی
  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('کاربر مورد نظر موجود نیست');

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

  async updateUserLocation(id: number, location: string): Promise<User> {
    const user = await this.findById(id);
    user.userLocation = location;
    return this.usersRepository.save(user);
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
    if (exists) return { message: 'Admin already exists' };

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
}
