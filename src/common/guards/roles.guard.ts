import { Injectable } from '@nestjs/common';
import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UnauthorizedException } from '@nestjs/common';
import { ROLES_KEY } from 'src/common/decorators/roles.decorator'; // وارد کردن دکوراتور نقش
import { Roles } from 'src/common/decorators//roles.enum'; // وارد کردن نقش‌ها از enum

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const roles = this.reflector.get<Roles[]>(ROLES_KEY, context.getHandler()); // دریافت نقش‌های مورد نیاز از دکوراتور

    if (!roles) {
      return true; // اگر نقش مشخص نشده باشد، به کاربر اجازه دسترسی داده می‌شود
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user; // اطلاعات کاربر از درخواست
    // اگر کاربر هیچ نقشی نداشته باشد یا نقش‌های وی اجازه دسترسی را ندهد، خطا می‌دهد
    if (!user || !roles.some((role) => user.role?.includes(role))) {
      throw new UnauthorizedException(
        'نقش کاربری شما برای دسترسی به این بخش مجاز نمی باشد',
      );
    }

    return true; // اگر کاربر اجازه دسترسی داشته باشد
  }
}
