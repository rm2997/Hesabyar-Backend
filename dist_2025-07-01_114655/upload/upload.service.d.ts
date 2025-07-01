import { ConfigService } from '@nestjs/config';
export declare class UploadService {
    private readonly configService;
    constructor(configService: ConfigService);
    saveFile(file: Express.Multer.File, folder: string): Promise<string>;
}
