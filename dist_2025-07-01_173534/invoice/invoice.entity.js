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
exports.Invoice = void 0;
const typeorm_1 = require("typeorm");
const proforma_entity_1 = require("../proforma/proforma.entity");
const users_entity_1 = require("../users/users.entity");
const customer_entity_1 = require("../customer/customer.entity");
const payment_enum_1 = require("../common/decorators/payment.enum");
const invoice_good_entity_1 = require("./invoice-good.entity");
let Invoice = class Invoice {
    id;
    title;
    isSent;
    isAccepted;
    acceptedBy;
    updateAt;
    sepidarId;
    proforma;
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
    invoiceGoods;
    createdAt;
    createdBy;
};
exports.Invoice = Invoice;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], Invoice.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], Invoice.prototype, "isSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bool', nullable: true, default: false }),
    __metadata("design:type", Boolean)
], Invoice.prototype, "isAccepted", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_entity_1.User, (user) => user.userAcceptedInvoice, {
        nullable: true,
    }),
    __metadata("design:type", users_entity_1.User)
], Invoice.prototype, "acceptedBy", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], Invoice.prototype, "updateAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'nvarchar', nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "sepidarId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => proforma_entity_1.Proforma, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'proforma_id' }),
    __metadata("design:type", proforma_entity_1.Proforma)
], Invoice.prototype, "proforma", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => customer_entity_1.Customer, { eager: true }),
    (0, typeorm_1.JoinColumn)({ name: 'customer_id' }),
    __metadata("design:type", customer_entity_1.Customer)
], Invoice.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal'),
    __metadata("design:type", Number)
], Invoice.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: payment_enum_1.PaymentTypes, default: payment_enum_1.PaymentTypes.Cash }),
    __metadata("design:type", String)
], Invoice.prototype, "paymentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Invoice.prototype, "chequeDate", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { nullable: true }),
    __metadata("design:type", Number)
], Invoice.prototype, "chequeAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Invoice.prototype, "chequeSerial", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Invoice.prototype, "paperMoneyDate", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { nullable: true }),
    __metadata("design:type", Number)
], Invoice.prototype, "paperMoneyAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Number)
], Invoice.prototype, "paperMoneySerial", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Invoice.prototype, "trustIssueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "approvedFile", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Invoice.prototype, "customerLink", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => invoice_good_entity_1.InvoiceGoods, (item) => item.invoice, {
        cascade: true,
        eager: true,
    }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Array)
], Invoice.prototype, "invoiceGoods", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], Invoice.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_entity_1.User, (user) => user.id),
    __metadata("design:type", users_entity_1.User)
], Invoice.prototype, "createdBy", void 0);
exports.Invoice = Invoice = __decorate([
    (0, typeorm_1.Entity)()
], Invoice);
//# sourceMappingURL=invoice.entity.js.map