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
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const jwt_decorator_1 = require("../common/decorators/jwt.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_enum_1 = require("../common/decorators/roles.enum");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const jwt_guard_1 = require("../common/guards/jwt.guard");
let AuthController = class AuthController {
    authService;
    constructor(authService) {
        this.authService = authService;
    }
    async login(body) {
        common_1.Logger.log(`New login request received...[username:${body.username} password:${body.password}]`);
        if (!body || !body.username || !body.password) {
            throw new common_1.UnauthorizedException('نام کاربری یا رمز اشتباه است');
        }
        const user = await this.authService.validateUser(body.username, body.password);
        if (!user) {
            throw new common_1.UnauthorizedException('نام کاربری یا رمز اشتباه است');
        }
        return this.authService.login(user);
    }
    async refreshToken(req, res) {
        const refreshToken = req.body.refreshToken;
        common_1.Logger.log('New refresh request received');
        if (!refreshToken) {
            return res.status(400).send({ message: 'Refresh token is required' });
        }
        try {
            const newAccessToken = await this.authService.refreshAccessToken(refreshToken);
            return res.json({ accessToken: newAccessToken });
        }
        catch (error) {
            return res.status(401).send({ message: 'Invalid refresh token' });
        }
    }
    async forgetPassword(body) {
        common_1.Logger.log(`New forget password request received...  ${body.mobileNumber}`);
        if (!body || !body.mobileNumber) {
            throw new common_1.NotFoundException('شماره همراه اشتباه است');
        }
        const user = await this.authService.validateMobileNumber(body.mobileNumber);
        if (!user) {
            throw new common_1.NotFoundException('نام کاربری یا رمز اشتباه است');
        }
        return user;
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, common_1.Post)('refresh'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, roles_decorator_1.UserRoles)(roles_enum_1.Roles.Admin),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "refreshToken", null);
__decorate([
    (0, common_1.Post)('forgetPassword'),
    (0, jwt_decorator_1.Public)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "forgetPassword", null);
exports.AuthController = AuthController = __decorate([
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map