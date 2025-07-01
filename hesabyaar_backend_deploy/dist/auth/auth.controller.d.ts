import { AuthService } from './auth.service';
import { Request, Response } from 'express';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(body: {
        username: string;
        password: string;
        location: string;
    }): Promise<{
        accessToken: string;
        refreshToken: string;
        mobilnumber: string;
        twoFactorAuthntication: boolean;
    }>;
    refreshToken(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
    forgetPassword(body: {
        mobileNumber: string;
    }): Promise<any>;
}
