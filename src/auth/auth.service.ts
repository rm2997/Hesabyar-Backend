import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import * as svgCaptcha from 'svg-captcha';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/users.entity';
import { OtpService } from 'src/otp/otp.service';
import { SmsService } from 'src/sms/sms.service';
import { randomUUID } from 'crypto';
import { InjectRepository } from '@nestjs/typeorm';
import { Captcha } from './captcha.entity';
import { Repository } from 'typeorm';

@Injectable()
export class AuthService {
  constructor(
    private readonly smsService: SmsService,
    private readonly otpSevice: OtpService,
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(Captcha)
    private readonly captchaRepository: Repository<Captcha>,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByUsername(username);
    console.log('User is:', user);

    if (!user || !user.isUserActive) {
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
      console.log('user with twoFactor:', user);

      const tempToken = this.jwtService.sign(payload, { expiresIn: '3m' });
      console.log('temp token:', tempToken);

      const otp = await this.otpSevice.generateNewOtp(user, tempToken);
      console.log('otp :', otp);

      await this.smsService.sendValidationKeySms(
        user.usermobilenumber,
        otp.code,
      );

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

  async generateCaptcha(ip: string) {
    const captcha = svgCaptcha.create({
      size: 5,
      noise: 2,
      color: true,
      background: '#eee',
    });

    const token = randomUUID();

    const captchaEntity = this.captchaRepository.create({
      token,
      text: captcha.text,
      ip: ip,
    });

    await this.captchaRepository.save(captchaEntity);
    return { svg: captcha.data, token };
  }

  async getFailedLoginCountByIp(ip: string) {
    return await this.captchaRepository.findAndCount({
      where: { ip: ip, isUsed: false },
    });
  }

  async getFailedLoginCountByUserName(username: string) {
    return await this.captchaRepository.findAndCount({
      where: { userName: username, isUsed: false },
    });
  }

  async deleteCapthaHistory(ip: string, userName: string) {
    if (ip) await this.captchaRepository.delete({ ip: ip });
    if (userName) await this.captchaRepository.delete({ userName: userName });
  }

  async verifyCaptha(token: string, userAnswer: string, ip: string) {
    const captcha = await this.captchaRepository.findOne({
      where: { token, isUsed: false },
    });

    if (!captcha || captcha.ip !== ip) {
      throw new BadRequestException('کپچا پیدا نشد یا معتبر نیست');
    }

    const isExpired =
      Date.now() - new Date(captcha.createdAt).getTime() > 3 * 60 * 1000;
    if (isExpired) {
      throw new BadRequestException('کپچا منقضی شده است');
    }

    if (captcha.text.toLowerCase() !== userAnswer.toLowerCase()) {
      throw new BadRequestException('پاسخ کپچا اشتباه است');
    }

    captcha.isUsed = true;
    await this.captchaRepository.save(captcha);
  }

  async secondLogin(user: User, token: string, code: string) {
    try {
      const verifyCode = await this.otpSevice.verifyUserCodeForLogin(
        code,
        user,
        token,
      );
      if (!verifyCode)
        throw new NotFoundException('کد ارسالی نامعتبر یا منقضی‌شده است');

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

  async validateMobileNumber(mobile: string) {
    const user = await this.usersService.findByMobileNumber(mobile);
    if (user && user.usermobilenumber) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async validateOtpToken(token: string) {
    try {
      const secret = this.config.get('USER_LINK_SECRET');
      console.log('secret is :', secret);

      const payload: any = this.jwtService.verify(token, secret);
      console.log('paylod is:', payload);

      const user = await this.usersService.findById(payload.sub);
      console.log('User for validateOtpToken is :', user);

      if (!user) throw new NotFoundException('کاربر موجود نیست');
      return user;
    } catch (err) {
      console.log(err);
      throw new NotFoundException('لینک نامعتبر یا منقضی‌شده است');
    }
  }
}
