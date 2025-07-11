import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

import { Logger } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin:
      process.env.NODE_ENV == 'production'
        ? ['https://hesab-yaar.ir', 'https://www.hesab-yaar.ir']
        : ['http://localhost:3000', 'http://www.localhost:3000'],
    // origin: [
    //   'http://localhost:3000',
    //   'https://hesab-yaar.ir',
    //   'https://www.hesab-yaar.ir',
    // ],
    credentials: true,
  });
  Logger.log(`App is listeninig to[${process.env.APP_PORT}]`);
  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
