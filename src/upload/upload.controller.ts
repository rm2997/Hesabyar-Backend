import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Param,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post(':type')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @Param('type') type: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const filePath = await this.uploadService.saveFile(file, type);
    return { url: `${process.env.STATIC_URL}/${filePath}` };
  }
}
