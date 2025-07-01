import { UsersService } from './users.service';
import { User } from './users.entity';
import { Request } from 'express';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    seedAdmin(): Promise<{
        message: string;
    }>;
    create(data: Partial<User>, req: Request): Promise<User | undefined>;
    findAll(page: number | undefined, limit: number | undefined, search: string): Promise<{
        items: User[];
        total: number;
    } | null>;
    getUserById(id: number): Promise<User>;
    getUserByMobileNumber(mobile: string): Promise<any>;
    getUserByToken(token: string): Promise<User | null>;
    changePass(id: number, data: {
        current: string;
        confirm: string;
        new: string;
    }, req: Request): Promise<User>;
    checkPassword(id: number, data: {
        password: string;
    }): Promise<{
        result: boolean;
    }>;
    changePasswordPublic(data: {
        current: string;
        new: string;
        token: string;
    }): Promise<User>;
    updateUserLocation(data: {
        location: string;
    }, req: Request): Promise<string | User>;
    sendLocationSms(id: number): Promise<any>;
    viewUserFromToken(token: string): Promise<User>;
    findOne(id: number, req: Request): Promise<User>;
    update(id: number, data: Partial<User>, req: Request): Promise<User>;
    remove(id: number): Promise<void>;
}
