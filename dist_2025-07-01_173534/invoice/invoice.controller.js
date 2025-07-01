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
exports.InvoiceController = void 0;
const common_1 = require("@nestjs/common");
const invoice_service_1 = require("./invoice.service");
const jwt_decorator_1 = require("../common/decorators/jwt.decorator");
const roles_guard_1 = require("../common/guards/roles.guard");
const jwt_guard_1 = require("../common/guards/jwt.guard");
const path_1 = require("path");
const fs_1 = require("fs");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
let InvoiceController = class InvoiceController {
    invoiceService;
    constructor(invoiceService) {
        this.invoiceService = invoiceService;
    }
    async create(data, req) {
        const user = req.user;
        console.log('Invoice data:', JSON.stringify(data));
        return await this.invoiceService.createInvoice(data, user);
    }
    async getAll() {
        return await this.invoiceService.getAllInvoices();
    }
    async generateNewToken(id) {
        return this.invoiceService.renewInvoiceToken(id);
    }
    async setProformaIsAccepted(id, req) {
        const acceptedBy = req.user;
        return await this.invoiceService.setInvoiceIsAccepted(id, acceptedBy);
    }
    async setInvoiceIsSent(id) {
        return await this.invoiceService.setInvoiceIsSent(id);
    }
    async getProformaApprovedFile(id, res) {
        const invoice = await this.invoiceService.getInvoice(id);
        if (!invoice)
            throw new common_1.NotFoundException('اطلاعات مورد نظر وجود ندارد');
        if (!invoice?.approvedFile)
            throw new common_1.NotFoundException('برای این پیش‌فاکتور فایل تاییدیه ثبت نشده است');
        const filePath = (0, path_1.join)(__dirname, '..', '..', invoice.approvedFile);
        if (!(0, fs_1.existsSync)(filePath)) {
            throw new common_1.NotFoundException('فایل در سرور موجود نیست');
        }
        res.setHeader('Content-Type', 'image/jpeg');
        return res.sendFile(filePath);
    }
    async viewInvoice(token) {
        console.log(token);
        return await this.invoiceService.verifyAndFetchInvoice(token);
    }
    async updateInvoiceByToken(token, image) {
        if (!image) {
            throw new common_1.BadRequestException('فایلی ارسال نشده است');
        }
        const invoice = await this.invoiceService.verifyAndFetchInvoice(token);
        if (!invoice)
            throw new common_1.NotFoundException('اطلاعات مورد نظر وجود ندارد');
        if (invoice.customerLink == token && invoice.approvedFile != null) {
            throw new common_1.BadRequestException('این توکن قبلا تایید شده است');
        }
        const filePath = `/uploads/invoice/${image.filename}`;
        invoice.approvedFile = filePath;
        return this.invoiceService.updateInvoice(invoice?.id, invoice, invoice.createdBy);
    }
    async get(id) {
        return await this.invoiceService.getInvoice(id);
    }
    async getUserInvoices(page = 1, limit = 10, search, req) {
        const user = req.user;
        return this.invoiceService.getUserInvoices(page, limit, search, user.id);
    }
    async update(id, data, req) {
        const user = req.user;
        return await this.invoiceService.updateInvoice(id, data, user);
    }
    async delete(id) {
        return await this.invoiceService.deleteInvoice(id);
    }
    async getShareableLink(id) {
        return {
            link: await this.invoiceService.generateShareableLink(id),
        };
    }
};
exports.InvoiceController = InvoiceController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "getAll", null);
__decorate([
    (0, common_1.Post)('generateNewToken/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "generateNewToken", null);
__decorate([
    (0, common_1.Patch)('accept/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "setProformaIsAccepted", null);
__decorate([
    (0, common_1.Patch)('sent/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "setInvoiceIsSent", null);
__decorate([
    (0, common_1.Get)('file/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "getProformaApprovedFile", null);
__decorate([
    (0, common_1.Get)('token/:token'),
    (0, jwt_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "viewInvoice", null);
__decorate([
    (0, common_1.Patch)('token/:token'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('image', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads/invoice',
            filename: (req, file, cb) => {
                const uniqueSuffix = 'invoice_' + Date.now() + Math.round(Math.random() * 1e9);
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
], InvoiceController.prototype, "updateInvoiceByToken", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "get", null);
__decorate([
    (0, common_1.Get)('user/my'),
    __param(0, (0, common_1.Query)('page')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('search')),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number, String, Object]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "getUserInvoices", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object, Object]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "delete", null);
__decorate([
    (0, common_1.Get)('share-link/:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], InvoiceController.prototype, "getShareableLink", null);
exports.InvoiceController = InvoiceController = __decorate([
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.Controller)('invoice'),
    __metadata("design:paramtypes", [invoice_service_1.InvoiceService])
], InvoiceController);
//# sourceMappingURL=invoice.controller.js.map