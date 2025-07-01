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
exports.ProformaController = void 0;
const common_1 = require("@nestjs/common");
const proforma_service_1 = require("./proforma.service");
const jwt_guard_1 = require("../common/guards/jwt.guard");
const roles_guard_1 = require("../common/guards/roles.guard");
const jwt_decorator_1 = require("../common/decorators/jwt.decorator");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const fs_1 = require("fs");
let ProformaController = class ProformaController {
    proformaService;
    constructor(proformaService) {
        this.proformaService = proformaService;
    }
    async create(data, req) {
        const user = req.user;
        return this.proformaService.createProforma(data, user);
    }
    async generateNewToken(id) {
        return this.proformaService.renewProformaToken(id);
    }
    async getProformaByToken(token) {
        return await this.proformaService.verifyAndFetchProforma(token);
    }
    async updateProfomaByToken(token, image) {
        if (!image) {
            throw new common_1.BadRequestException('فایلی ارسال نشده است');
        }
        const proforma = await this.proformaService.verifyAndFetchProforma(token);
        if (!proforma)
            throw new common_1.NotFoundException('اطلاعات مورد نظر وجود ندارد');
        if (proforma.customerLink == token && proforma.approvedFile != null) {
            throw new common_1.BadRequestException('این توکن قبلا تایید شده است');
        }
        const filePath = `/uploads/proforma/${image.filename}`;
        proforma.approvedFile = filePath;
        return this.proformaService.updateProforma(proforma?.id, proforma, proforma.createdBy);
    }
    async setProformaIsAccepted(id, req) {
        const acceptedBy = req.user;
        return await this.proformaService.setProformaIsAccepted(id, acceptedBy);
    }
    async setProformaIsSent(id) {
        return await this.proformaService.setProformaIsSent(id);
    }
    async getProformaApprovedFile(id, res) {
        const proforma = await this.proformaService.getProforma(id);
        if (!proforma)
            throw new common_1.NotFoundException('اطلاعات مورد نظر وجود ندارد');
        if (!proforma?.approvedFile)
            throw new common_1.NotFoundException('برای این پیش‌فاکتور فایل تاییدیه ثبت نشده است');
        const filePath = (0, path_1.join)(__dirname, '..', '..', proforma.approvedFile);
        if (!(0, fs_1.existsSync)(filePath)) {
            throw new common_1.NotFoundException('فایل در سرور موجود نیست');
        }
        res.setHeader('Content-Type', 'image/jpeg');
        return res.sendFile(filePath);
    }
    async getShareableLink(id) {
        return {
            link: await this.proformaService.generateShareableLink(id),
        };
    }
    async convert(id, req) {
        const user = req.user;
        return this.proformaService.convertToInvoice(id, user);
    }
    async viewProforma(token) {
        return await this.proformaService.verifyAndFetchProforma(token);
    }
    async getByUserId(page = 1, limit = 10, search, req) {
        const user = req.user;
        return this.proformaService.getAllByUser(page, limit, search, user);
    }
    async getAll() {
        return this.proformaService.getAll();
    }
    async get(id) {
        const response = this.proformaService.getProforma(id);
        return response;
    }
    async update(id, data, req) {
        const user = req.user;
        return this.proformaService.updateProforma(id, data, user);
    }
    async delete(id) {
        return this.proformaService.deleteProforma(id);
    }
};
exports.ProformaController = ProformaController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ProformaController.prototype, "create", null);
__decorate([
    (0, common_1.Post)('generateNewToken/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProformaController.prototype, "generateNewToken", null);
__decorate([
    (0, common_1.Get)('token/:token'),
    (0, jwt_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProformaController.prototype, "getProformaByToken", null);
__decorate([
    (0, common_1.Patch)('token/:token'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/proforma',
            filename: (req, file, cb) => {
                const uniqueSuffix = 'proforma_' + Date.now() + Math.round(Math.random() * 1e9);
                cb(null, `${uniqueSuffix}${(0, path_1.extname)(file.originalname)}`);
            },
        }),
    })),
    (0, jwt_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('token')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ProformaController.prototype, "updateProfomaByToken", null);
__decorate([
    (0, common_1.Patch)('accept/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProformaController.prototype, "setProformaIsAccepted", null);
__decorate([
    (0, common_1.Patch)('sent/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProformaController.prototype, "setProformaIsSent", null);
__decorate([
    (0, common_1.Get)('file/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProformaController.prototype, "getProformaApprovedFile", null);
__decorate([
    (0, common_1.Get)('share-link/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProformaController.prototype, "getShareableLink", null);
__decorate([
    (0, common_1.Put)('convert/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], ProformaController.prototype, "convert", null);
__decorate([
    (0, common_1.Get)('view/:token'),
    (0, jwt_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], ProformaController.prototype, "viewProforma", null);
__decorate([
    (0, common_1.Get)('user/my'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, Object]),
    __metadata("design:returntype", Promise)
], ProformaController.prototype, "getByUserId", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ProformaController.prototype, "getAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProformaController.prototype, "get", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], ProformaController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], ProformaController.prototype, "delete", null);
exports.ProformaController = ProformaController = __decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('proforma'),
    __metadata("design:paramtypes", [proforma_service_1.ProformaService])
], ProformaController);
//# sourceMappingURL=proforma.controller.js.map