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
exports.DepotService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const depot_entity_1 = require("./depot.entity");
let DepotService = class DepotService {
    depotRepository;
    constructor(depotRepository) {
        this.depotRepository = depotRepository;
    }
    async createDepot(data, user) {
        const Depot = this.depotRepository.create({
            ...data,
            createdAt: new Date(),
            createdBy: { id: user },
        });
        const saved = await this.depotRepository.save(Depot);
        return saved;
    }
    async getAllDepots() {
        return await this.depotRepository.find();
    }
    async getDepotById(id) {
        const Depot = await this.depotRepository.findOne({ where: { id } });
        if (!Depot)
            throw new common_1.NotFoundException();
        return Depot;
    }
    async updateDepot(id, data) {
        const Depot = await this.depotRepository.findOne({
            where: { id: id },
        });
        if (!Depot)
            throw new common_1.NotFoundException();
        Depot.depotName = data?.depotName;
        Depot.depotInfo = data?.depotInfo;
        console.log(Depot);
        return this.depotRepository.save(Depot);
    }
    async deleteDepot(id) {
        const Depot = await this.depotRepository.findOne({
            where: { id: id },
        });
        if (!Depot)
            throw new common_1.NotFoundException();
        await this.depotRepository.delete(id);
    }
};
exports.DepotService = DepotService;
exports.DepotService = DepotService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(depot_entity_1.Depot)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], DepotService);
//# sourceMappingURL=depot.service.js.map