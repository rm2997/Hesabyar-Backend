import { CanActivate, ExecutionContext } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { AuthService } from 'src/auth/auth.service';
export declare class AuthGuard implements CanActivate {
    private readonly authService;
    private readonly jwtService;
    private readonly userService;
    constructor(authService: AuthService, jwtService: JwtService, userService: UsersService);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
