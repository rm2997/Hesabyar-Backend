import { SetMetadata } from '@nestjs/common';
import { Roles } from './roles.enum'; // وارد کردن نقش‌ها از enum

// کلید برای ذخیره نقش‌ها در متادیتا
export const ROLES_KEY = 'roles';

// دکوراتور برای تعیین نقش‌های مورد نیاز
export const UserRoles = (...roles: Roles[]) => SetMetadata(ROLES_KEY, roles);
