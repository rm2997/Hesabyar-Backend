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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const bcrypt = require("bcrypt");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
let AuthService = class AuthService {
    usersService;
    jwtService;
    config;
    constructor(usersService, jwtService, config) {
        this.usersService = usersService;
        this.jwtService = jwtService;
        this.config = config;
    }
    async validateUser(username, pass) {
        const user = await this.usersService.findByUsername(username);
        if (!user)
            throw new common_1.NotFoundException('نام کاربری یا رمز اشتباه است');
        if (await bcrypt.compare(pass, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        else
            throw new common_1.NotFoundException('نام کاربری یا رمز اشتباه است');
    }
    async login(user) {
        const payload = { username: user.username, sub: user.id, role: user.role };
        const accessToken = this.jwtService.sign(payload, { expiresIn: '1d' });
        const refreshToken = this.jwtService.sign(payload, { expiresIn: '1d' });
        const mobilnumber = user?.usermobilenumber;
        const twoFactorAuthntication = user?.twoFactorAuthntication;
        return { accessToken, refreshToken, mobilnumber, twoFactorAuthntication };
    }
    async refreshAccessToken(refreshToken) {
        try {
            const verifiedPayload = this.jwtService.verify(refreshToken, {
                secret: this.config.get('JWT_SECRET'),
            });
            const payload = {
                username: verifiedPayload.username,
                sub: verifiedPayload.id,
                role: verifiedPayload.role,
            };
            const accessToken = this.jwtService.sign(payload, {
                expiresIn: '15m',
            });
            return accessToken;
        }
        catch (e) {
            throw new Error('Invalid refresh token');
        }
    }
    async validateMobileNumber(mobile) {
        const user = await this.usersService.findByMobileNumber(mobile);
        if (user && user.usermobilenumber) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService])
], AuthService);
//# sourceMappingURL=auth.service.js.map