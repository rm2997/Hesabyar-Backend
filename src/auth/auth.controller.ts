import {
  Controller,
  Post,
  Body,
  UseGuards,
  Logger,
  NotFoundException,
  Req,
  Res,
  Get,
  BadRequestException,
} from '@nestjs/common';

import { AuthService } from './auth.service';
import { Public } from 'src/common/decorators/jwt.decorator';
import { Request, Response } from 'express';
import { RolesGuard } from 'src/common/guards/roles.guard';
import { Roles } from 'src/common/decorators/roles.enum';
import { UserRoles } from 'src/common/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/common/guards/jwt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(
    @Req() req: Request,
    @Body()
    body: {
      username: string;
      password: string;
      location?: string;
      captchaToken?: string;
      captchaAnswer?: string;
    },
  ) {
    const clintIp = req?.ip!;
    if (!clintIp)
      throw new BadRequestException('آدرس آی پی درخواست دهنده مشخص نیست');

    if (!body || !body.username || !body.password) {
      console.log('خطا در دریافت داده', body);
      throw new NotFoundException('نام کاربری یا رمز ارسال نشده است');
    }

    const ipAttemps = await this.authService.getFailedLoginCountByIp(clintIp);
    let requiredCaptcha = ipAttemps[1] >= 3 ? true : false;

    if (!requiredCaptcha) {
      const userAttemps = await this.authService.getFailedLoginCountByUserName(
        body.username,
      );
      requiredCaptcha = userAttemps[1] > 0 ? true : false;
    }

    if (requiredCaptcha && (!body.captchaToken || !body.captchaAnswer))
      throw new BadRequestException('لطفا کپچا را ارسال کنید');

    if (requiredCaptcha) {
      await this.authService.verifyCaptha(
        body?.captchaToken!,
        body?.captchaAnswer!,
        clintIp,
      );
    }

    const user = await this.authService.validateUser(
      body.username,
      body.password,
    );

    if (!user) {
      throw new NotFoundException('نام کاربری یا رمز اشتباه است');
    }
    Logger.log(
      `New login request received...[username:${body.username} password:${body.password}]`,
    );

    await this.authService.deleteCapthaHistory(clintIp, body.username);
    return this.authService.login(user);
  }

  @Public()
  @Get('captcha')
  async generateCaptcha(@Req() req: Request, @Res() res: Response) {
    res.setHeader('Content-Type', 'application/json');
    const clientIp = req?.ip!;
    if (!clientIp)
      throw new BadRequestException('آدرس آی پی درخواست دهنده مشخص نیست');
    const result = await this.authService.generateCaptcha(clientIp);
    res.send(result);
  }

  @Post('secondLogin')
  @Public()
  async secondLogin(@Body() data: { code: string; token: string }) {
    console.log('request key and token is:', data);

    const user = await this.authService.validateOtpToken(data.token);
    if (!user) return;
    return await this.authService.secondLogin(user, data.token, data.code);
  }

  @Post('resendValidationKey')
  @Public()
  async resendValidationKey(@Body() data: { mobile: string; token: string }) {
    const user = await this.authService.validateOtpToken(data.token);
    if (!user) return;
    return this.authService.resendValidationKey(data);
  }

  @Post('refresh')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @UserRoles(Roles.Admin)
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.body.refreshToken;
    Logger.log('New refresh request received');

    if (!refreshToken) {
      return res.status(400).send({ message: 'Refresh token is required' });
    }

    try {
      const newAccessToken =
        await this.authService.refreshAccessToken(refreshToken);
      return res.json({ accessToken: newAccessToken });
    } catch (error) {
      return res.status(401).send({ message: 'Invalid refresh token' });
    }
  }

  @Post('forgetPassword')
  @Public()
  async forgetPassword(@Body() body: { mobileNumber: string }) {
    Logger.log(`New forget password request received...  ${body.mobileNumber}`);

    if (!body || !body.mobileNumber) {
      throw new NotFoundException('شماره همراه اشتباه است');
    }
    const user = await this.authService.validateMobileNumber(body.mobileNumber);
    if (!user) {
      throw new NotFoundException('نام کاربری یا رمز اشتباه است');
    }
    return user;
  }
}
