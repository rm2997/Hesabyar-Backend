"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProformaModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const proforma_controller_1 = require("./proforma.controller");
const proforma_service_1 = require("./proforma.service");
const proforma_entity_1 = require("./proforma.entity");
const auth_module_1 = require("../auth/auth.module");
const proforma_goods_entity_1 = require("./proforma-goods.entity");
let ProformaModule = class ProformaModule {
};
exports.ProformaModule = ProformaModule;
exports.ProformaModule = ProformaModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([proforma_entity_1.Proforma, proforma_goods_entity_1.ProformaGoods]), auth_module_1.AuthModule],
        controllers: [proforma_controller_1.ProformaController],
        providers: [proforma_service_1.ProformaService],
        exports: [proforma_service_1.ProformaService],
    })
], ProformaModule);
//# sourceMappingURL=proforma.module.js.map