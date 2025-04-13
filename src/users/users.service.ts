import { Injectable, NotFoundException } from '@nestjs/common';
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
    return this.usersRepository.findOne({ where: { username } });
  }

  // نمایش کل کاربران
  async findAll(): Promise<User[] | null> {
    return this.usersRepository.find();
  }

  // دریافت کاربر با آیدی
  async findById(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  // دریافت کاربر با موبایل
  async findByMobileNumber(usermobilenumber: string): Promise<User | null> {
    const user = this.usersRepository.findOne({ where: { usermobilenumber } });
    if (!user) throw new NotFoundException('Moblie number not found');
    return user;
  }

  // بروزرسانی کاربر
  async updateUser(id: number, updateData: Partial<User>): Promise<User> {
    const user = await this.findById(id);

    if (updateData.password) {
      const salt = await bcrypt.genSalt();
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    Object.assign(user, updateData);
    return this.usersRepository.save(user);
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
  async createUser(userData: User): Promise<User | undefined> {
    const user = new User();
    user.username = userData.username;
    user.usermobilenumber = userData.usermobilenumber;

    const salt = await bcrypt.genSalt();
    user.password = await bcrypt.hash(userData.password, salt);

    user.role = userData.role || 'User';
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
