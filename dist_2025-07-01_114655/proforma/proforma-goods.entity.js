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
exports.ProformaGoods = void 0;
const typeorm_1 = require("typeorm");
const users_entity_1 = require("../users/users.entity");
const good_entity_1 = require("../goods/good.entity");
const proforma_entity_1 = require("./proforma.entity");
let ProformaGoods = class ProformaGoods {
    id;
    quantity;
    price;
    total;
    proforma;
    good;
    description;
    createdAt;
    createdBy;
};
exports.ProformaGoods = ProformaGoods;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], ProformaGoods.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ProformaGoods.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ProformaGoods.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], ProformaGoods.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => proforma_entity_1.Proforma, (proforma) => proforma.proformaGoods, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Array)
], ProformaGoods.prototype, "proforma", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => good_entity_1.Good, (good) => good.goodProforma, {
        onDelete: 'CASCADE',
        eager: true,
    }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Array)
], ProformaGoods.prototype, "good", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], ProformaGoods.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], ProformaGoods.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_entity_1.User, (user) => user.id),
    __metadata("design:type", users_entity_1.User)
], ProformaGoods.prototype, "createdBy", void 0);
exports.ProformaGoods = ProformaGoods = __decorate([
    (0, typeorm_1.Entity)()
], ProformaGoods);
//# sourceMappingURL=proforma-goods.entity.js.map