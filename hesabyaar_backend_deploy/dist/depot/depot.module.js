"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DepotModule = void 0;
const common_1 = require("@nestjs/common");
const depot_controller_1 = require("./depot.controller");
const depot_service_1 = require("./depot.service");
const typeorm_1 = require("@nestjs/typeorm");
const depot_entity_1 = require("./depot.entity");
let DepotModule = class DepotModule {
};
exports.DepotModule = DepotModule;
exports.DepotModule = DepotModule = __decorate([
    (0, common_1.Module)({
        imports: [typeorm_1.TypeOrmModule.forFeature([depot_entity_1.Depot])],
        controllers: [depot_controller_1.DepotController],
        providers: [depot_service_1.DepotService],
    })
], DepotModule);
//# sourceMappingURL=depot.module.js.map