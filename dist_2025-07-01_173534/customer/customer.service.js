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
exports.CustomerService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const customer_entity_1 = require("./customer.entity");
const typeorm_2 = require("typeorm");
let CustomerService = class CustomerService {
    customerRepository;
    dataSource;
    constructor(customerRepository, dataSource) {
        this.customerRepository = customerRepository;
        this.dataSource = dataSource;
    }
    async createCustomer(data, user) {
        const customer = this.customerRepository.create({
            ...data,
            createdAt: new Date(),
            createdBy: { id: user },
        });
        const saved = await this.customerRepository.save(customer);
        return saved;
    }
    async getAllCustomers(page, limit, search) {
        const query = this.dataSource
            .getRepository(customer_entity_1.Customer)
            .createQueryBuilder('customer');
        if (search && search.trim().length > 0) {
            query
                .andWhere('customer.customerLName LIKE :search', {
                search: `%${search}%`,
            })
                .orWhere('customer.customerFName LIKE :search', {
                search: `%${search}%`,
            });
        }
        const total = await query.getCount();
        const items = await query
            .skip(limit == -1 ? 0 : (page - 1) * limit)
            .take(limit == -1 ? undefined : limit)
            .orderBy('customer.id', 'DESC')
            .getMany();
        return { total, items };
    }
    async getCustomerById(id) {
        const customer = await this.customerRepository.findOne({ where: { id } });
        if (!customer)
            throw new common_1.NotFoundException();
        console.log(customer);
        return customer;
    }
    async updateCustomer(id, data) {
        const customer = await this.customerRepository.findOne({
            where: { id: id },
        });
        if (!customer)
            throw new common_1.NotFoundException();
        customer.customerFName = data?.customerFName;
        customer.customerLName = data?.customerLName;
        customer.customerAddress = data?.customerAddress;
        customer.customerNationalCode = data?.customerNationalCode;
        customer.customerPhone = data?.customerPhone;
        customer.customerMobile = data?.customerMobile;
        customer.customerGender = data?.customerGender;
        customer.customerPostalCode = data?.customerPostalCode;
        console.log(customer);
        return this.customerRepository.save(customer);
    }
    async deleteCustomer(id) {
        const customer = await this.customerRepository.findOne({
            where: { id: id },
        });
        if (!customer)
            throw new common_1.NotFoundException();
        await this.customerRepository.delete(id);
    }
};
exports.CustomerService = CustomerService;
exports.CustomerService = CustomerService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(customer_entity_1.Customer)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.DataSource])
], CustomerService);
//# sourceMappingURL=customer.service.js.map