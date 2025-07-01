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
exports.InvoiceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const invoice_entity_1 = require("./invoice.entity");
const proforma_service_1 = require("../proforma/proforma.service");
const config_1 = require("@nestjs/config");
const jwt = require("jsonwebtoken");
const invoice_good_entity_1 = require("./invoice-good.entity");
let InvoiceService = class InvoiceService {
    invoiceRepository;
    proformaService;
    invoiceGoodsRepository;
    dataSource;
    configService;
    constructor(invoiceRepository, proformaService, invoiceGoodsRepository, dataSource, configService) {
        this.invoiceRepository = invoiceRepository;
        this.proformaService = proformaService;
        this.invoiceGoodsRepository = invoiceGoodsRepository;
        this.dataSource = dataSource;
        this.configService = configService;
    }
    async createInvoice(data, user) {
        const proforma = await this.proformaService.getProforma(data?.proforma?.id);
        if (!proforma) {
            throw new Error('Proforma not found');
        }
        const invoiceGoods = [...data?.invoiceGoods];
        invoiceGoods.map((item) => {
            item.createdBy = user;
        });
        const invoice = this.invoiceRepository.create({
            ...data,
            invoiceGoods: [...invoiceGoods],
            createdAt: Date(),
            createdBy: user,
            proforma: proforma,
        });
        const shareableLink = await this.generateShareableLink(invoice.id);
        invoice.customerLink = shareableLink;
        common_1.Logger.log(`Incomming invoice data is : ${invoice.invoiceGoods[0].quantity}`);
        return await this.invoiceRepository.save(invoice);
    }
    async getAllInvoices() {
        return await this.invoiceRepository.find();
    }
    async getInvoice(id) {
        return await this.invoiceRepository.findOne({ where: { id } });
    }
    async getUserInvoices(page, limit, search, userId) {
        const query = this.dataSource
            .getRepository(invoice_entity_1.Invoice)
            .createQueryBuilder('invoice')
            .leftJoinAndSelect('invoice.createdBy', 'user')
            .leftJoinAndSelect('invoice.customer', 'customer')
            .leftJoinAndSelect('invoice.invoiceGoods', 'invoiceGoods')
            .leftJoinAndSelect('invoiceGoods.good', 'good')
            .andWhere('invoice.createdBy= :user', { user: userId });
        if (search) {
            query.andWhere('invoice.id= :search', { search: search });
        }
        const total = await query.getCount();
        const items = await query
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('invoice.createdAt', 'DESC')
            .getMany();
        return { items, total };
    }
    async updateInvoice(id, data, updatedBy) {
        const invoice = await this.invoiceRepository.findOne({
            where: { id },
            relations: ['invoiceGoods'],
        });
        if (invoice) {
            invoice.totalAmount = data?.totalAmount;
            data?.invoiceGoods?.map((g) => {
                if (g.id == 0) {
                    g.createdAt = new Date();
                    g.createdBy = updatedBy;
                }
                else {
                    g.createdBy = updatedBy;
                }
            });
            await this.invoiceGoodsRepository.remove(invoice?.invoiceGoods);
            invoice.invoiceGoods = [...data?.invoiceGoods];
            return await this.invoiceRepository.save({ ...invoice, ...data });
        }
        throw new Error('Invoice not found');
    }
    async deleteInvoice(id) {
        await this.invoiceRepository.delete(id);
    }
    async generateShareableLink(invoiceId) {
        const payload = { invoiceId };
        const secret = this.configService.get('INVOICE_LINK_SECRET');
        const expiresIn = this.configService.get('INVOICE_LINK_EXPIRES_IN');
        const token = jwt.sign(payload, secret, { expiresIn });
        return token;
    }
    async verifyAndFetchInvoice(token) {
        try {
            const secret = this.configService.get('INVOICE_LINK_SECRET');
            const payload = jwt.verify(token, secret);
            const invoice = await this.invoiceRepository.findOne({
                where: { id: payload.invoiceId },
                relations: ['createdBy'],
            });
            if (!invoice)
                throw new common_1.NotFoundException('فاکتور پیدا نشد');
            return invoice;
        }
        catch (err) {
            throw new common_1.UnauthorizedException('لینک نامعتبر یا منقضی‌شده است');
        }
    }
    async setInvoiceIsAccepted(id, acceptedBy) {
        const invoice = await this.invoiceRepository.findOne({ where: { id } });
        if (invoice) {
            return this.invoiceRepository.save({
                ...invoice,
                isAccepted: true,
                acceptedBy: acceptedBy,
            });
        }
        throw new common_1.NotFoundException('فاکتور وجود ندارد');
    }
    async setInvoiceIsSent(id) {
        const invoice = await this.invoiceRepository.findOne({ where: { id } });
        if (invoice) {
            return this.invoiceRepository.save({ ...invoice, isSent: true });
        }
        throw new common_1.NotFoundException('فاکتور وجود ندارد');
    }
    async renewInvoiceToken(invoiceId) {
        try {
            const invoice = await this.invoiceRepository.findOne({
                where: { id: invoiceId },
            });
            if (invoice) {
                const newToken = await this.generateShareableLink(invoiceId);
                invoice.customerLink = newToken;
                invoice.isSent = false;
                invoice.approvedFile = '';
                await this.invoiceRepository.save(invoice);
                return newToken;
            }
            throw new common_1.NotFoundException('پیش‌فاکتور وجود ندارد');
        }
        catch (error) { }
    }
};
exports.InvoiceService = InvoiceService;
exports.InvoiceService = InvoiceService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(invoice_entity_1.Invoice)),
    __param(2, (0, typeorm_1.InjectRepository)(invoice_good_entity_1.InvoiceGoods)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        proforma_service_1.ProformaService,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        config_1.ConfigService])
], InvoiceService);
//# sourceMappingURL=invoice.service.js.map