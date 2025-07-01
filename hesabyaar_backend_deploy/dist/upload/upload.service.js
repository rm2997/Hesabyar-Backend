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
exports.UploadService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const path_1 = require("path");
const fs = require("fs");
let UploadService = class UploadService {
    configService;
    constructor(configService) {
        this.configService = configService;
    }
    async saveFile(file, folder) {
        const uploadPath = `${this.configService.get('UPLOAD_FOLDER')}/${folder}`;
        if (!fs.existsSync(uploadPath))
            fs.mkdirSync(uploadPath, { recursive: true });
        const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}${(0, path_1.extname)(file.originalname)}`;
        const filePath = `${uploadPath}/${fileName}`;
        fs.writeFileSync(filePath, file.buffer);
        return `${folder}/${fileName}`;
    }
};
exports.UploadService = UploadService;
exports.UploadService = UploadService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], UploadService);
//# sourceMappingURL=upload.service.js.map