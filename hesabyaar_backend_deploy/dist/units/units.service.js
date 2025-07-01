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
exports.UnitsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const unit_entity_1 = require("./unit.entity");
let UnitsService = class UnitsService {
    unitRepository;
    dataSource;
    constructor(unitRepository, dataSource) {
        this.unitRepository = unitRepository;
        this.dataSource = dataSource;
    }
    async createUnit(data, user) {
        const Unit = this.unitRepository.create({
            ...data,
            createdAt: new Date(),
            createdBy: { id: user },
        });
        const saved = await this.unitRepository.save(Unit);
        return saved;
    }
    async getAllUnits(page, limit, search) {
        const query = this.dataSource
            .getRepository(unit_entity_1.Unit)
            .createQueryBuilder('unit');
        if (search) {
            query.andWhere('unit.unitName LIKE :search', { search: `%${search}%` });
        }
        const total = await query.getCount();
        const items = await query
            .skip((page - 1) * limit)
            .take(limit)
            .orderBy('unit.id', 'DESC')
            .getMany();
        return { items, total };
    }
    async getUnitById(id) {
        const unit = await this.unitRepository.findOne({ where: { id } });
        if (!unit)
            throw new common_1.NotFoundException();
        return unit;
    }
    async updateUnit(id, data) {
        const unit = await this.unitRepository.findOne({
            where: { id: id },
        });
        if (!unit)
            throw new common_1.NotFoundException();
        unit.unitName = data?.unitName;
        unit.unitInfo = data?.unitInfo;
        console.log(unit_entity_1.Unit);
        return this.unitRepository.save(unit);
    }
    async deleteUnit(id) {
        const unit = await this.unitRepository.findOne({
            where: { id: id },
        });
        if (!unit)
            throw new common_1.NotFoundException();
        await this.unitRepository.delete(id);
    }
};
exports.UnitsService = UnitsService;
exports.UnitsService = UnitsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(unit_entity_1.Unit)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], UnitsService);
//# sourceMappingURL=units.service.js.map