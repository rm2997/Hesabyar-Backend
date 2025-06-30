import { UploadService } from './upload.service';
export declare class UploadController {
    private readonly uploadService;
    constructor(uploadService: UploadService);
    upload(type: string, file: Express.Multer.File): Promise<{
        url: string;
    }>;
}
