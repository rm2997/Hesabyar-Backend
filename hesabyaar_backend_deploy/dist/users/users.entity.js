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
exports.User = void 0;
const typeorm_1 = require("typeorm");
const notification_entity_1 = require("../notification/notification.entity");
const roles_enum_1 = require("../common/decorators/roles.enum");
const customer_entity_1 = require("../customer/customer.entity");
const good_entity_1 = require("../goods/good.entity");
const proforma_entity_1 = require("../proforma/proforma.entity");
const invoice_entity_1 = require("../invoice/invoice.entity");
let User = class User {
    id;
    username;
    password;
    role;
    userfname;
    userlname;
    usermobilenumber;
    createdAt;
    createdBy;
    userLocation;
    lastLogin;
    twoFactorAuthntication;
    userAcceptedProforma;
    userConvertedProforma;
    userAcceptedInvoice;
    usernotifications;
    assignednotifications;
    customers;
    goods;
};
exports.User = User;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)(),
    __metadata("design:type", Number)
], User.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true }),
    __metadata("design:type", String)
], User.prototype, "username", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "password", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'enum', enum: roles_enum_1.Roles }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "userfname", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], User.prototype, "userlname", void 0);
__decorate([
    (0, typeorm_1.Column)({ unique: true, length: 11 }),
    __metadata("design:type", String)
], User.prototype, "usermobilenumber", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], User.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Number)
], User.prototype, "createdBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], User.prototype, "userLocation", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], User.prototype, "lastLogin", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: Boolean, nullable: false, default: 1 }),
    __metadata("design:type", Boolean)
], User.prototype, "twoFactorAuthntication", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => proforma_entity_1.Proforma, (proforma) => proforma.acceptedBy),
    __metadata("design:type", Array)
], User.prototype, "userAcceptedProforma", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => proforma_entity_1.Proforma, (proforma) => proforma.convertedBy),
    __metadata("design:type", Array)
], User.prototype, "userConvertedProforma", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => invoice_entity_1.Invoice, (invoice) => invoice.acceptedBy),
    __metadata("design:type", Array)
], User.prototype, "userAcceptedInvoice", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_entity_1.Notification, (notification) => notification.fromUser),
    __metadata("design:type", Array)
], User.prototype, "usernotifications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => notification_entity_1.Notification, (notification) => notification.toUser),
    __metadata("design:type", Array)
], User.prototype, "assignednotifications", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => customer_entity_1.Customer, (customer) => customer.id),
    __metadata("design:type", Array)
], User.prototype, "customers", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => good_entity_1.Good, (good) => good.id),
    __metadata("design:type", Array)
], User.prototype, "goods", void 0);
exports.User = User = __decorate([
    (0, typeorm_1.Entity)('users')
], User);
//# sourceMappingURL=users.entity.js.map