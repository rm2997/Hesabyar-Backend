import { Roles } from './roles.enum';
export declare const ROLES_KEY = "roles";
export declare const UserRoles: (...roles: Roles[]) => import("@nestjs/common").CustomDecorator<string>;
