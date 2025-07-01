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
exports.ProformaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const jwt = require("jsonwebtoken");
const typeorm_2 = require("typeorm");
const proforma_entity_1 = require("./proforma.entity");
const config_1 = require("@nestjs/config");
const proforma_goods_entity_1 = require("./proforma-goods.entity");
let ProformaService = class ProformaService {
    proformaRepository;
    proformaGoodsRepository;
    dataSource;
    configService;
    constructor(proformaRepository, proformaGoodsRepository, dataSource, configService) {
        this.proformaRepository = proformaRepository;
        this.proformaGoodsRepository = proformaGoodsRepository;
        this.dataSource = dataSource;
        this.configService = configService;
    }
    async createProforma(data, user) {
        const proformaGoods = [...data?.proformaGoods];
        proformaGoods.map((item) => {
            item.createdBy = user;
        });
        const proforma = this.proformaRepository.create({
            ...data,
            proformaGoods: [...proformaGoods],
            createdAt: new Date(),
            createdBy: { id: user.id },
        });
        const savedProforma = await this.proformaRepository.save(proforma);
        const shareableLink = await this.generateShareableLink(savedProforma.id);
        savedProforma.customerLink = shareableLink;
        return this.proformaRepository.save(savedProforma);
    }
    async getAll() {
        return this.proformaRepository.find({ order: { createdAt: 'DESC' } });
    }
    async getProforma(id) {
        const proforma = this.proformaRepository.findOne({ where: { id } });
        proforma.then((res) => {
            console.log(res?.customer);
        });
        return proforma;
    }
    async getAllByUser(page, limit, search, user) {
        const query = this.dataSource
            .getRepository(proforma_entity_1.Proforma)
            .createQueryBuilder('proforma')
            .leftJoinAndSelect('proforma.createdBy', 'user')
            .leftJoinAndSelect('proforma.customer', 'customer')
            .leftJoinAndSelect('proforma.proformaGoods', 'proformaGoods')
            .leftJoinAndSelect('proformaGoods.good', 'good')
            .andWhere('proforma.createdBy= :user', { user: user.id });
        if (search) {
            query.andWhere('proforma.id= :id', { id: search });
        }
        const total = await query.getCount();
        const items = await query
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('proforma.createdAt', 'DESC')
            .getMany();
        return { total, items };
    }
    async updateProforma(id, data, updatedBy) {
        const proforma = await this.proformaRepository.findOne({
            where: { id },
            relations: ['proformaGoods'],
        });
        if (proforma) {
            proforma.totalAmount = data?.totalAmount;
            data?.proformaGoods?.map((g) => {
                if (g.id == 0) {
                    g.createdAt = new Date();
                    g.createdBy = updatedBy;
                }
                else {
                    g.createdBy = updatedBy;
                }
            });
            await this.proformaGoodsRepository.remove(proforma.proformaGoods);
            proforma.proformaGoods = [...data?.proformaGoods];
            return await this.proformaRepository.save({ ...proforma, ...data });
        }
        throw new common_1.NotFoundException('پیش‌فاکتور وجود ندارد');
    }
    async setProformaIsAccepted(id, acceptedBy) {
        const proforma = await this.proformaRepository.findOne({ where: { id } });
        if (proforma) {
            return this.proformaRepository.save({
                ...proforma,
                isAccepted: true,
                acceptedBy: acceptedBy,
            });
        }
        throw new common_1.NotFoundException('پیش‌فاکتور وجود ندارد');
    }
    async setProformaIsSent(id) {
        const proforma = await this.proformaRepository.findOne({ where: { id } });
        if (proforma) {
            return this.proformaRepository.save({ ...proforma, isSent: true });
        }
        throw new common_1.NotFoundException('پیش‌فاکتور وجود ندارد');
    }
    async convertToInvoice(id, user) {
        const proforma = await this.proformaRepository.findOne({ where: { id } });
        if (proforma) {
            proforma.isConverted = true;
            proforma.convertedBy = user;
            return this.proformaRepository.save(proforma);
        }
        throw new common_1.NotFoundException('پیش‌فاکتور وجود ندارد');
    }
    async deleteProforma(id) {
        await this.proformaRepository.delete(id);
    }
    async generateShareableLink(proformaId) {
        const payload = { proformaId };
        const secret = this.configService.get('PROFORMA_LINK_SECRET');
        const expiresIn = this.configService.get('PROFORMA_LINK_EXPIRES_IN');
        const token = jwt.sign(payload, secret, { expiresIn });
        return token;
    }
    async renewProformaToken(proformaId) {
        try {
            const proforma = await this.proformaRepository.findOne({
                where: { id: proformaId },
            });
            if (proforma) {
                const newToken = await this.generateShareableLink(proformaId);
                proforma.customerLink = newToken;
                proforma.isSent = false;
                proforma.approvedFile = '';
                await this.proformaRepository.save(proforma);
                return newToken;
            }
            throw new common_1.NotFoundException('پیش‌فاکتور وجود ندارد');
        }
        catch (error) { }
    }
    async verifyAndFetchProforma(token) {
        try {
            const secret = this.configService.get('PROFORMA_LINK_SECRET');
            const payload = jwt.verify(token, secret);
            const proforma = await this.proformaRepository.findOne({
                where: { id: payload.proformaId },
                relations: ['createdBy'],
            });
            if (!proforma)
                throw new common_1.NotFoundException('پیش‌فاکتور یافت نشد');
            return proforma;
        }
        catch (err) {
            throw new common_1.NotFoundException('لینک نامعتبر یا منقضی‌شده است');
        }
    }
};
exports.ProformaService = ProformaService;
exports.ProformaService = ProformaService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(proforma_entity_1.Proforma)),
    __param(1, (0, typeorm_1.InjectRepository)(proforma_goods_entity_1.ProformaGoods)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.DataSource,
        config_1.ConfigService])
], ProformaService);
//# sourceMappingURL=proforma.service.js.map