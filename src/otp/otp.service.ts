import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Otp } from './otp.entity';
import { Repository } from 'typeorm';
import { SmsService } from 'src/sms/sms.service';
import { User } from 'src/users/users.entity';

@Injectable()
export class OtpService {
  constructor(
    @InjectRepository(Otp) private readonly otpRepository: Repository<Otp>,
    private readonly smsService: SmsService,
  ) {}

  async verifyUserCodeForLogin(
    code: string,
    user: User,
    token: string,
  ): Promise<boolean> {
    const otp = await this.otpRepository.findOne({
      where: { mobileNumber: user.usermobilenumber, token: token, code: code },
    });

    if (!otp) return false;
    if (Date.now() > otp.expiresAt.getTime()) {
      this.otpRepository.delete(otp.id);
      return false;
    }
    this.otpRepository.delete(otp.id);
    return true;
  }

  async generateNewRandomCodeAndSend(
    user: User,
    token: string,
  ): Promise<number> {
    const oldOtp = await this.otpRepository.findOne({
      where: { mobileNumber: user.usermobilenumber },
    });
    if (oldOtp) {
      this.otpRepository.delete(oldOtp.id);
    }
    const rnd = Math.floor(10000 + Math.random() * 90000);
    const newOtp = this.otpRepository.create();
    newOtp.code = rnd.toString();
    newOtp.mobileNumber = user.usermobilenumber;
    newOtp.token = token;
    newOtp.toUser = user;
    newOtp.expiresAt = new Date(Date.now() + 3 * 60 * 1000); //3 Min later
    await this.otpRepository.save(newOtp);
    await this.smsService.sendValidationKeySms(
      newOtp.mobileNumber,
      newOtp.code,
    );
    return rnd;
  }

  async verifyOtp(data: { token: string; mobile: string }) {
    return await this.otpRepository.findOne({
      where: { mobileNumber: data.mobile, token: data.token },
    });
  }

  async resendValidationKey(data: { token: string; mobile: string }) {
    try {
      const oldOtp = this.otpRepository.findOne({
        where: { mobileNumber: data.mobile, token: data.token },
      });
    } catch (error) {
      throw new NotFoundException('توکن نامعتبر یا منقضی شده است');
    }
  }
}
