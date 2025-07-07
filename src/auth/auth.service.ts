import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/users.entity';
import { OtpService } from 'src/otp/otp.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly otpSevice: OtpService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
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

  async generatNewToken(payload) {}

  async login(user: User) {
    if (user.twoFactorAuthntication) {
      const payload = {
        username: user.username,
        sub: user.id,
        role: user.role,
      };
      const tempToken = this.jwtService.sign(payload, { expiresIn: '3m' });
      await this.otpSevice.generateNewRandomCodeAndSend(user, tempToken);
      return {
        mobilnumber: user.usermobilenumber,
        twoFactorAuthntication: true,
        accessToken: tempToken,
      };
    }
    const payload = { username: user.username, sub: user.id, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
    const mobilnumber = user?.usermobilenumber;
    const twoFactorAuthntication = user?.twoFactorAuthntication;
    return { accessToken, mobilnumber, twoFactorAuthntication };
  }

  async secondLogin(token: string, code: string) {
    try {
      const secret = this.config.get('USER_LINK_SECRET');
      const payload: any = this.jwtService.verify(token, secret);
      const user = await this.usersService.findById(payload.userId);
      if (!user) throw new NotFoundException('کاربر موجود نیست');
      const verifyCode = await this.otpSevice.verifyUserCodeForLogin(
        code,
        user,
        token,
      );
      if (!verifyCode)
        throw new UnauthorizedException('کد ارسالی نامعتبر یا منقضی‌شده است');

      const userPayload = {
        username: user.username,
        sub: user.id,
        role: user.role,
      };
      const accessToken = this.jwtService.sign(userPayload, {
        expiresIn: '1d',
      });
      const refreshToken = this.jwtService.sign(userPayload, {
        expiresIn: '1d',
      });
      const mobilnumber = user?.usermobilenumber;
      const twoFactorAuthntication = user?.twoFactorAuthntication;
      return { accessToken, refreshToken, mobilnumber, twoFactorAuthntication };
    } catch (error) {
      throw new UnauthorizedException('لینک نامعتبر یا منقضی‌شده است');
    }
  }

  async validateToken(token: string) {
    const user = await this.usersService.findByToken(token);
    if (!user) throw new NotFoundException('توکن منقضی شده یا معتبر نیست');

    return user;
  }

  async resendValidationKey(data: { token: string; mobile: string }) {
    const otp = await this.otpSevice.verifyOtp(data);
    if (!otp)
      throw new NotFoundException('امکان ارسال مجدد رمز یکبار وجود مصرف ندارد');

    return await this.login(otp.toUser);
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
