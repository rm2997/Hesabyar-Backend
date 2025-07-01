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
exports.Proforma = void 0;
const typeorm_1 = require("typeorm");
const users_entity_1 = require("../users/users.entity");
const customer_entity_1 = require("../customer/customer.entity");
const payment_enum_1 = require("../common/decorators/payment.enum");
const proforma_goods_entity_1 = require("./proforma-goods.entity");
let Proforma = class Proforma {
    id;
    title;
    isConverted;
    convertedBy;
    isAccepted;
    acceptedBy;
    customer;
    totalAmount;
    paymentStatus;
    chequeDate;
    chequeAmount;
    chequeSerial;
    paperMoneyDate;
    paperMoneyAmount;
    paperMoneySerial;
    trustIssueDate;
    approvedFile;
    customerLink;
    description;
    createdAt;
    updatedAt;
    sepidarId;
    isSent;
    proformaGoods;
    createdBy;
};
exports.Proforma = Proforma;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Proforma.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Proforma.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bool', nullable: true, default: false }),
    __metadata("design:type", Boolean)
], Proforma.prototype, "isConverted", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_entity_1.User, (user) => user.userConvertedProforma, {
        nullable: true,
    }),
    __metadata("design:type", users_entity_1.User)
], Proforma.prototype, "convertedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bool', nullable: true, default: false }),
    __metadata("design:type", Boolean)
], Proforma.prototype, "isAccepted", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_entity_1.User, (user) => user.userAcceptedProforma, {
        nullable: true,
    }),
    __metadata("design:type", users_entity_1.User)
], Proforma.prototype, "acceptedBy", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], Proforma.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal'),
    __metadata("design:type", Number)
], Proforma.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: payment_enum_1.PaymentTypes, default: payment_enum_1.PaymentTypes.Cash }),
    __metadata("design:type", String)
], Proforma.prototype, "paymentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Proforma.prototype, "chequeDate", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { nullable: true }),
    __metadata("design:type", Number)
], Proforma.prototype, "chequeAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Proforma.prototype, "chequeSerial", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Proforma.prototype, "paperMoneyDate", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { nullable: true }),
    __metadata("design:type", Number)
], Proforma.prototype, "paperMoneyAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Proforma.prototype, "paperMoneySerial", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Proforma.prototype, "trustIssueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Proforma.prototype, "approvedFile", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Proforma.prototype, "customerLink", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Proforma.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Proforma.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Proforma.prototype, "updatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', nullable: true }),
    __metadata("design:type", String)
], Proforma.prototype, "sepidarId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Proforma.prototype, "isSent", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => proforma_goods_entity_1.ProformaGoods, (item) => item.proforma, {
        cascade: true,
        eager: true,
        orphanedRowAction: 'delete',
    }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Array)
], Proforma.prototype, "proformaGoods", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_entity_1.User, (user) => user.id),
    __metadata("design:type", users_entity_1.User)
], Proforma.prototype, "createdBy", void 0);
exports.Proforma = Proforma = __decorate([
    (0, typeorm_1.Entity)()
], Proforma);
//# sourceMappingURL=proforma.entity.js.map