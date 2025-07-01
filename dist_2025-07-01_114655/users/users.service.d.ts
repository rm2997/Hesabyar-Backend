import { DataSource, Repository } from 'typeorm';
import { User } from './users.entity';
import { ConfigService } from '@nestjs/config';
export declare class UsersService {
    private usersRepository;
    private readonly dataSource;
    private configService;
    constructor(usersRepository: Repository<User>, dataSource: DataSource, configService: ConfigService);
    findByUsername(username: string): Promise<User | null>;
    findAll(page: number, limit: number, search: string): Promise<{
        items: User[];
        total: number;
    } | null>;
    findById(id: number): Promise<User>;
    findByMobileNumber(usermobilenumber: string): Promise<any | null>;
    findByToken(token: string): Promise<User | null>;
    updateUser(id: number, updateData: Partial<User>): Promise<User>;
    updateUserLocation(user: User, location: string): Promise<any | string>;
    sendLocationSms(userId: number): Promise<any | string>;
    checkPassword(id: number, password: string): Promise<{
        result: boolean;
    }>;
    changePasswordFromOut(passwordData: {
        current: string;
        new: string;
        token: string;
    }): Promise<User>;
    changePass(id: number, passwordData: {
        current: string;
        confirm: string;
        new: string;
    }, issuedUser: User): Promise<User>;
    deleteUser(id: number): Promise<void>;
    validatePassword(hashPassword: string, plainPassword: string): Promise<boolean>;
    createUser(userData: Partial<User>, issuedUser: User): Promise<User | undefined>;
    createAdmin(): Promise<{
        message: string;
    }>;
    generateUserLocationLink(userId: number): Promise<string>;
    verifyUserLocationToken(token: string): Promise<User>;
    generateUserChangePassToken(userId: number): Promise<string>;
    verifyUserChangePassToken(token: string): Promise<User>;
}
