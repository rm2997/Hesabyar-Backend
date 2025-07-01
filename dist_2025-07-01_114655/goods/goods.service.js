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
exports.GoodsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const good_entity_1 = require("./good.entity");
const units_service_1 = require("../units/units.service");
let GoodsService = class GoodsService {
    goodRepository;
    unitService;
    dataSource;
    constructor(goodRepository, unitService, dataSource) {
        this.goodRepository = goodRepository;
        this.unitService = unitService;
        this.dataSource = dataSource;
    }
    async createGood(data, user) {
        const Good = this.goodRepository.create({
            ...data,
            createdAt: new Date(),
            createdBy: { id: user },
        });
        const saved = await this.goodRepository.save(Good);
        return saved;
    }
    async createGoodFromExcelFile(data, user) {
        let counter = 0;
        const unit = await this.unitService.getUnitById(1);
        data.forEach(async (record) => {
            const fieldNames = Object.keys(record);
            const sepidarId = record[fieldNames[2]];
            const goodName = record[fieldNames[3]];
            const Good = this.goodRepository.create({
                goodInfo: 'آپلود دسته ای',
                goodName: goodName,
                goodPrice: 0,
                sepidarId: sepidarId,
                goodUnit: unit,
                createdAt: new Date(),
                createdBy: user,
            });
            await this.goodRepository.save(Good);
            counter++;
        });
        return { message: 'درج اطلاعات کالا توسط فایل انجام شد', rows: counter };
    }
    async getAllGoods(page, limit, search) {
        const query = this.dataSource
            .getRepository(good_entity_1.Good)
            .createQueryBuilder('good')
            .leftJoinAndSelect('good.goodUnit', 'unit');
        if (search) {
            query.andWhere('good.goodName LIKE :search', { search: `%${search}%` });
        }
        const total = await query.getCount();
        const items = await query
            .skip(limit == -1 ? 0 : (page - 1) * limit)
            .take(limit == -1 ? undefined : limit)
            .orderBy('good.id', 'DESC')
            .getMany();
        return { items, total };
    }
    async getGoodsByCount(count) {
        return await this.goodRepository.find();
    }
    async getGoodById(id) {
        const Good = await this.goodRepository.findOne({ where: { id } });
        if (!Good)
            throw new common_1.NotFoundException();
        return Good;
    }
    async updateGood(id, data) {
        const Good = await this.goodRepository.findOne({
            where: { id: id },
        });
        if (!Good)
            throw new common_1.NotFoundException();
        const unit = await this.unitService.getUnitById(data?.goodUnit?.id);
        if (!unit)
            throw new common_1.NotFoundException('واحد انتخاب شده در دیتابیس وجود ندارد');
        Good.goodName = data?.goodName;
        Good.goodUnit = unit;
        Good.goodInfo = data?.goodInfo;
        console.log(Good);
        return this.goodRepository.save(Good);
    }
    async deleteGood(id) {
        const Good = await this.goodRepository.findOne({
            where: { id: id },
        });
        if (!Good)
            throw new common_1.NotFoundException();
        await this.goodRepository.delete(id);
    }
};
exports.GoodsService = GoodsService;
exports.GoodsService = GoodsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(good_entity_1.Good)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        units_service_1.UnitsService,
        typeorm_2.DataSource])
], GoodsService);
//# sourceMappingURL=goods.service.js.map