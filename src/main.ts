import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: ['http://localhost:3000'],
    credentials: true,
  });
  app.use(
    '/uploads',
    express.static(join(__dirname, '..', process.env.UPLOAD_FOLDER + '')),
  );
  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
