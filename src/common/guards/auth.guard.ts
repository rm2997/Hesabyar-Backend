import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt'; // برای بررسی توکن JWT
import { Observable } from 'rxjs';
import { UsersService } from 'src/users/users.service'; // سرویس مربوط به کاربر
import { AuthService } from 'src/auth/auth.service'; // سرویس احراز هویت
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService, // استفاده از سرویس احراز هویت
    private readonly jwtService: JwtService, // سرویس JWT برای بررسی توکن
    private readonly userService: UsersService, // سرویس کاربر برای دسترسی به اطلاعات کاربر
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = request.headers['authorization']?.split(' ')[1]; // گرفتن توکن از هدر

    if (!token) {
      throw new UnauthorizedException('No token provided'); // اگر توکنی وجود نداشته باشد، خطا می‌دهد
    }

    try {
      // تایید توکن و استخراج اطلاعات کاربر
      const decoded = this.jwtService.verify(token);
      const user = await this.userService.findById(decoded.userId);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      request.user = user; // ذخیره اطلاعات کاربر در درخواست
      return true; // اجازه دسترسی به مسیر
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired token'); // اگر توکن معتبر نباشد یا منقضی شود
    }
  }
}
