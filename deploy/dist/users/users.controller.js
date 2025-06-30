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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const jwt_guard_1 = require("../common/guards/jwt.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const roles_decorator_1 = require("../common/decorators/roles.decorator");
const roles_enum_1 = require("../common/decorators/roles.enum");
const jwt_decorator_1 = require("../common/decorators/jwt.decorator");
let UsersController = class UsersController {
    usersService;
    constructor(usersService) {
        this.usersService = usersService;
    }
    async seedAdmin() {
        return this.usersService.createAdmin();
    }
    async create(data, req) {
        const issuedUser = req.user;
        return this.usersService.createUser(data, issuedUser);
    }
    async findAll(page = 1, limit = 10, search) {
        return this.usersService.findAll(page, limit, search);
    }
    async getUserByMobileNumber(mobile) {
        return this.usersService.findByMobileNumber(mobile);
    }
    async getUserByToken(token) {
        return this.usersService.findByToken(token);
    }
    async changePass(id, data, req) {
        const user = req.user;
        if (user.role === roles_enum_1.Roles.Admin || user.id === id)
            return this.usersService.changePass(id, data, user);
        else
            throw new common_1.UnauthorizedException('شما نمی توانید کلمه عبور سایر کاربران را تغییر دهید');
    }
    async changePasswordPublic(data) {
        return this.usersService.changePasswordFromOut(data);
    }
    async updateUserLocation(data, req) {
        const user = req.user;
        if (!data?.location)
            throw new common_1.BadRequestException('موقعیت مکانی صحیح نیست');
        return this.usersService.updateUserLocation(user, data.location);
    }
    async sendLocationSms(id) {
        return this.usersService.sendLocationSms(id);
    }
    async viewUserFromToken(token) {
        return await this.usersService.verifyUserLocationToken(token);
    }
    async findOne(id, req) {
        const user = req.user;
        const isOwner = user.id === +id;
        const isAdmin = user.role === 'admin';
        if (!isOwner && !isAdmin) {
            throw new common_1.ForbiddenException('شما فقط می توانید اطلاعات خودتان را مشاهده کنید');
        }
        return this.usersService.findById(id);
    }
    async update(id, data, req) {
        const user = req.user;
        const isOwner = user.id === +id;
        const isAdmin = user.role === 'admin';
        if (!isOwner && !isAdmin) {
            throw new common_1.ForbiddenException('شما فقط می‌توانید اطلاعات خودتان را ویرایش کنید.');
        }
        return this.usersService.updateUser(id, data);
    }
    async remove(id) {
        return this.usersService.deleteUser(id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)('seed-admin'),
    (0, jwt_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "seedAdmin", null);
__decorate([
    (0, common_1.Post)(),
    (0, roles_decorator_1.UserRoles)(roles_enum_1.Roles.Admin),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.UserRoles)(roles_enum_1.Roles.Admin),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('forgetpassword/:mobileNumber'),
    (0, jwt_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('mobile')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserByMobileNumber", null);
__decorate([
    (0, common_1.Get)('token/:token'),
    (0, jwt_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getUserByToken", null);
__decorate([
    (0, common_1.Put)('changePass/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changePass", null);
__decorate([
    (0, common_1.Put)('changePassExternal'),
    (0, jwt_decorator_1.Public)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "changePasswordPublic", null);
__decorate([
    (0, common_1.Put)('location'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateUserLocation", null);
__decorate([
    (0, common_1.Post)('sms/:id'),
    __param(0, (0, common_1.Param)('id', new common_1.ParseIntPipe({
        exceptionFactory: (err) => new common_1.BadRequestException(),
    }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "sendLocationSms", null);
__decorate([
    (0, common_1.Get)('view/:token'),
    (0, jwt_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "viewUserFromToken", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, roles_decorator_1.UserRoles)(roles_enum_1.Roles.Admin),
    __param(0, (0, common_1.Param)('id', new common_1.ParseIntPipe({
        exceptionFactory: (err) => new common_1.BadRequestException(),
    }))),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.UserRoles)(roles_enum_1.Roles.Admin),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
exports.UsersController = UsersController = __decorate([
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map