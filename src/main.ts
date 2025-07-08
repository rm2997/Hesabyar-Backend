import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

import { Logger } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    // origin:
    // process.env.NODE_ENV == 'production'
    // ? ['https://hesab-yaar.ir']
    // : ['http://localhost:3000'],
    origin: ['https://hesab-yaar.ir', 'http://localhost:3000'],
    credentials: true,
  });
  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.method === 'OPTIONS') {
      res.header('Access-Control-Allow-Origin', '*');
      res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
      res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
      return res.sendStatus(200);
    }
    next();
  });
  Logger.log(`App is listeninig to[${process.env.APP_PORT}]`);
  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
