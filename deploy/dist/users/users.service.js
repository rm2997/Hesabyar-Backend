"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const users_entity_1 = require("./users.entity");
const bcrypt = require("bcrypt");
const roles_enum_1 = require("../common/decorators/roles.enum");
const config_1 = require("@nestjs/config");
const jwt = require("jsonwebtoken");
let UsersService = class UsersService {
    usersRepository;
    dataSource;
    configService;
    constructor(usersRepository, dataSource, configService) {
        this.usersRepository = usersRepository;
        this.dataSource = dataSource;
        this.configService = configService;
    }
    async findByUsername(username) {
        const user = await this.usersRepository.findOne({ where: { username } });
        if (!user)
            throw new common_1.NotFoundException('کاربر مورد نظر شما موجود نیست');
        return user;
    }
    async findAll(page, limit, search) {
        const query = this.dataSource
            .getRepository(users_entity_1.User)
            .createQueryBuilder('user');
        if (search) {
            query.andWhere('user.userName LIKE :search', { search: `%${search}%` });
        }
        const total = await query.getCount();
        const items = await query
            .skip((page - 1) * limit)
            .take(limit)
            .getMany();
        return { total, items };
    }
    async findById(id) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException(`کاربر مورد نظر موجود نیست ${id}`);
        return { ...user, password: '' };
    }
    async findByMobileNumber(usermobilenumber) {
        const user = await this.usersRepository.findOne({
            where: { usermobilenumber },
        });
        if (!user)
            throw new common_1.NotFoundException('Moblie number not found');
        const token = await this.generateUserChangePassToken(user?.id);
        return { ...user, password: '', token: token };
    }
    async findByToken(token) {
        const user = await this.verifyUserChangePassToken(token);
        if (!user)
            throw new common_1.NotFoundException('User not found');
        console.log(user);
        return { ...user, password: '' };
    }
    async updateUser(id, updateData) {
        const user = await this.findById(id);
        if (updateData.password) {
            const salt = await bcrypt.genSalt();
            updateData.password = await bcrypt.hash(updateData.password, salt);
        }
        Object.assign(user, updateData);
        return this.usersRepository.save(user);
    }
    async updateUserLocation(user, location) {
        const existingUser = await this.usersRepository.findOne({
            where: { id: user?.id },
        });
        if (!existingUser)
            return 'کاربر موردنظر در سیستم وجود ندارد';
        if (!location)
            return 'موقعیت مکانی صحیح نیست';
        console.log('user for set location:', user);
        return this.usersRepository
            .createQueryBuilder()
            .update(users_entity_1.User)
            .set({ userLocation: location, lastLogin: new Date() })
            .where('id = :id', { id: user?.id })
            .execute();
    }
    async sendLocationSms(userId) {
        const existingUser = await this.usersRepository.findOne({
            where: { id: userId },
        });
        if (!existingUser)
            return 'کاربر موردنظر در سیستم وجود ندارد';
        const link = await this.generateUserLocationLink(userId);
        const title = 'درخواست موقعیت مکانی';
        const body = 'همکار محترم ' +
            existingUser.userfname +
            ' ' +
            existingUser.userlname +
            ' ' +
            'لطفا در اولین فرصت موقعیت خود را از طریق لینک زیر به مجموعه ارسال فرمایید.' +
            '\r\n' +
            link;
        return body;
    }
    async changePasswordFromOut(passwordData) {
        const userByToken = await this.verifyUserChangePassToken(passwordData.token);
        if (!userByToken)
            throw new common_1.NotFoundException();
        const user = await this.findById(userByToken.id);
        if (!user)
            throw new common_1.NotFoundException();
        let newPass = '';
        if (passwordData.new) {
            const salt = await bcrypt.genSalt();
            newPass = await bcrypt.hash(passwordData.new, salt);
        }
        user.password = newPass;
        return this.usersRepository.save(user);
    }
    async changePass(id, passwordData, issuedUser) {
        const user = await this.findById(id);
        if (issuedUser.role === roles_enum_1.Roles.Admin ||
            (await this.validatePassword(user, passwordData.current))) {
            let newPass = '';
            if (passwordData.new) {
                const salt = await bcrypt.genSalt();
                newPass = await bcrypt.hash(passwordData.new, salt);
            }
            user.password = newPass;
            return this.usersRepository.save(user);
        }
        else
            throw new common_1.UnauthorizedException('کلمه عبور جاری صحیح نیست');
    }
    async deleteUser(id) {
        const result = await this.usersRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException('User not found');
        }
    }
    async validatePassword(user, plainPassword) {
        return bcrypt.compare(plainPassword, user.password);
    }
    async createUser(userData, issuedUser) {
        const user = this.usersRepository.create({
            ...userData,
            createdAt: new Date(),
            createdBy: issuedUser?.id,
        });
        const salt = await bcrypt.genSalt();
        user.password = await bcrypt.hash(userData.password, salt);
        return this.usersRepository.save(user);
    }
    async createAdmin() {
        const exists = await this.usersRepository.findOne({
            where: { username: 'admin' },
        });
        if (exists) {
            const salt = await bcrypt.genSalt();
            const password = await bcrypt.hash('admin1234', salt);
            exists.password = password;
            await this.usersRepository.save(exists);
            return { message: 'Admin updated successfully' };
        }
        const salt = await bcrypt.genSalt();
        const password = await bcrypt.hash('admin1234', salt);
        const admin = this.usersRepository.create({
            username: 'admin',
            password,
            userfname: 'reza',
            userlname: 'mirasgari',
            usermobilenumber: '09125213288',
            role: roles_enum_1.Roles.Admin,
        });
        await this.usersRepository.save(admin);
        return { message: 'Admin created successfully' };
    }
    async generateUserLocationLink(userId) {
        const payload = { userId };
        const secret = this.configService.get('USER_LINK_SECRET');
        const expiresIn = this.configService.get('USER_LINK_EXPIRES_IN');
        const token = jwt.sign(payload, secret, { expiresIn });
        const baseUrl = this.configService.get('FRONT_APP_URL');
        return `${baseUrl}/sendLocationLink/${token}`;
    }
    async verifyUserLocationToken(token) {
        try {
            const secret = this.configService.get('USER_LINK_SECRET');
            const payload = jwt.verify(token, secret);
            const user = await this.usersRepository.findOne({
                where: { id: payload.userId },
            });
            if (!user)
                throw new common_1.NotFoundException('کاربر موجود نیست');
            return user;
        }
        catch (err) {
            throw new common_1.UnauthorizedException('لینک نامعتبر یا منقضی‌شده است');
        }
    }
    async generateUserChangePassToken(userId) {
        const payload = { userId };
        const secret = this.configService.get('USER_LINK_SECRET');
        const expiresIn = this.configService.get('USER_LINK_EXPIRES_IN');
        const token = jwt.sign(payload, secret, { expiresIn });
        return token;
    }
    async verifyUserChangePassToken(token) {
        try {
            const secret = this.configService.get('USER_LINK_SECRET');
            const payload = jwt.verify(token, secret);
            const user = await this.usersRepository.findOne({
                where: { id: payload.userId },
            });
            if (!user)
                throw new common_1.NotFoundException('کاربر موجود نیست');
            return user;
        }
        catch (err) {
            throw new common_1.BadRequestException('لینک نامعتبر یا منقضی‌شده است');
        }
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(users_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource,
        config_1.ConfigService])
], UsersService);
//# sourceMappingURL=users.service.js.map