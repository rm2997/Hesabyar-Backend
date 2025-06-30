import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';

import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin:
      process.env.NODE_ENV == 'production'
        ? ['https://hesab-yaar.ir']
        : ['http://localhost:3000'],
    credentials: true,
  });

  Logger.log(`App is listeninig to[${process.env.APP_PORT}]`);
  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
