import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { extname } from 'path';
import * as fs from 'fs';

@Injectable()
export class UploadService {
  constructor(private readonly configService: ConfigService) {}

  async saveFile(file: Express.Multer.File, folder: string): Promise<string> {
    const uploadPath = `${this.configService.get('UPLOAD_FOLDER')}/${folder}`;
    if (!fs.existsSync(uploadPath))
      fs.mkdirSync(uploadPath, { recursive: true });

    const fileName = `${Date.now()}-${Math.floor(Math.random() * 1000)}${extname(file.originalname)}`;
    const filePath = `${uploadPath}/${fileName}`;

    fs.writeFileSync(filePath, file.buffer);
    return `${folder}/${fileName}`; // relative path
  }
}
