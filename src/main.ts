import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(
    '/uploads',
    express.static(join(__dirname, '..', process.env.UPLOAD_FOLDER + '')),
  );
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
