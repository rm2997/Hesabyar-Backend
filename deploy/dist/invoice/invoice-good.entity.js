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
exports.InvoiceGoods = void 0;
const typeorm_1 = require("typeorm");
const users_entity_1 = require("../users/users.entity");
const good_entity_1 = require("../goods/good.entity");
const invoice_entity_1 = require("./invoice.entity");
let InvoiceGoods = class InvoiceGoods {
    id;
    quantity;
    price;
    total;
    invoice;
    good;
    createdAt;
    createdBy;
};
exports.InvoiceGoods = InvoiceGoods;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], InvoiceGoods.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], InvoiceGoods.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], InvoiceGoods.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], InvoiceGoods.prototype, "total", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => invoice_entity_1.Invoice, (invoice) => invoice.invoiceGoods, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Array)
], InvoiceGoods.prototype, "invoice", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => good_entity_1.Good, (good) => good.goodInvoice, {
        onDelete: 'CASCADE',
        eager: true,
    }),
    (0, typeorm_1.JoinColumn)(),
    __metadata("design:type", Array)
], InvoiceGoods.prototype, "good", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' }),
    __metadata("design:type", Date)
], InvoiceGoods.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => users_entity_1.User, (user) => user.id),
    __metadata("design:type", users_entity_1.User)
], InvoiceGoods.prototype, "createdBy", void 0);
exports.InvoiceGoods = InvoiceGoods = __decorate([
    (0, typeorm_1.Entity)()
], InvoiceGoods);
//# sourceMappingURL=invoice-good.entity.js.map