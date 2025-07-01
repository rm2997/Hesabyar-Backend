"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const proforma_module_1 = require("./proforma/proforma.module");
const invoice_module_1 = require("./invoice/invoice.module");
const upload_module_1 = require("./upload/upload.module");
const auth_module_1 = require("./auth/auth.module");
const notification_module_1 = require("./notification/notification.module");
const customer_module_1 = require("./customer/customer.module");
const goods_module_1 = require("./goods/goods.module");
const app_service_1 = require("./app.service");
const sales_module_1 = require("./sales/sales.module");
const depot_module_1 = require("./depot/depot.module");
const units_module_1 = require("./units/units.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'mysql',
                    host: configService.get('DB_HOST'),
                    port: configService.get('DB_PORT'),
                    username: configService.get('DB_USERNAME'),
                    password: configService.get('DB_PASSWORD'),
                    database: configService.get('DB_NAME'),
                    autoLoadEntities: true,
                    synchronize: configService.get('NODE_ENV') !== 'production',
                    logging: true,
                    logger: 'advanced-console',
                }),
            }),
            proforma_module_1.ProformaModule,
            invoice_module_1.InvoiceModule,
            upload_module_1.UploadModule,
            auth_module_1.AuthModule,
            notification_module_1.NotificationModule,
            customer_module_1.CustomerModule,
            goods_module_1.GoodsModule,
            sales_module_1.SalesModule,
            depot_module_1.DepotModule,
            units_module_1.UnitsModule,
        ],
        providers: [app_service_1.AppService],
        controllers: [],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map