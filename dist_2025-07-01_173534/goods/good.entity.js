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
exports.Good = void 0;
const invoice_good_entity_1 = require("../invoice/invoice-good.entity");
const proforma_goods_entity_1 = require("../proforma/proforma-goods.entity");
const unit_entity_1 = require("../units/unit.entity");
const users_entity_1 = require("../users/users.entity");
const typeorm_1 = require("typeorm");
let Good = class Good {
    id;
    goodName;
    goodPrice;
    goodInfo;
    createdAt;
    updatedAt;
    sepidarId;
    goodInvoice;
    goodProforma;
    goodUnit;
    createdBy;
    good;
};
exports.Good = Good;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Good.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Good.prototype, "goodName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], Good.prototype, "goodPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Good.prototype, "goodInfo", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Good.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Good.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', nullable: true }),
    __metadata("design:type", String)
], Good.prototype, "sepidarId", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => invoice_good_entity_1.InvoiceGoods, (item) => item.good, {
        cascade: true,
    }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Array)
], Good.prototype, "goodInvoice", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => proforma_goods_entity_1.ProformaGoods, (item) => item.good, {
        cascade: true,
    }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Array)
], Good.prototype, "goodProforma", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => unit_entity_1.Unit, (unit) => unit.goods, {
        eager: true,
        onDelete: 'SET NULL',
    }),
    __metadata("design:type", unit_entity_1.Unit)
], Good.prototype, "goodUnit", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_entity_1.User, (user) => user.id, { nullable: false }),
    __metadata("design:type", users_entity_1.User)
], Good.prototype, "createdBy", void 0);
exports.Good = Good = __decorate([
    (0, typeorm_1.Entity)()
], Good);
//# sourceMappingURL=good.entity.js.map