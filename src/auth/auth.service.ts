import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/users.entity';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  // بررسی ورود کاربر
  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);

    if (!user) {
      console.log('User not found', user);
      throw new NotFoundException('نام کاربری یا رمز اشتباه است');
    }

    if (await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    } else {
      console.log('Icorrect password', pass, user.password);
      throw new NotFoundException('نام کاربری یا رمز اشتباه است');
    }
  }

  async login(user: User) {
    const payload = { username: user.username, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    const mobilnumber = user?.usermobilenumber;
    const twoFactorAuthntication = user?.twoFactorAuthntication;
    return { accessToken, refreshToken, mobilnumber, twoFactorAuthntication };
  }

  async refreshAccessToken(refreshToken: string): Promise<any> {
    try {
      // تایید صحت توکن رفرش
      const verifiedPayload = this.jwtService.verify(refreshToken, {
        secret: this.config.get<string>('JWT_SECRET'),
      });

      const payload = {
        username: verifiedPayload.username,
        sub: verifiedPayload.id,
        role: verifiedPayload.role,
      };
      // ساخت توکن جدید
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: '15m',
      });

      return accessToken;
    } catch (e) {
      throw new Error('Invalid refresh token');
    }
  }

  // بررسی شماره موبایل کاربر
  async validateMobileNumber(mobile: string) {
    const user = await this.usersService.findByMobileNumber(mobile);
    if (user && user.usermobilenumber) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
