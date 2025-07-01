import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { User } from 'src/users/users.entity';
export declare class AuthService {
    private usersService;
    private jwtService;
    private config;
    constructor(usersService: UsersService, jwtService: JwtService, config: ConfigService);
    validateUser(username: string, pass: string): Promise<any>;
    login(user: User): Promise<{
        accessToken: string;
        refreshToken: string;
        mobilnumber: string;
        twoFactorAuthntication: boolean;
    }>;
    refreshAccessToken(refreshToken: string): Promise<any>;
    validateMobileNumber(mobile: string): Promise<any>;
}
