import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';
import { CryptoUtil } from './common/utils/crypto.util';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const localOrigin = ['http://localhost:3000', 'http://www.localhost:3000'];
  const proOrigin = ['https://www.hesab-yaar.ir', 'https://hesab-yaar.ir'];
  app.enableCors({
    origin: process.env.NODE_ENV == 'production' ? proOrigin : localOrigin,
    credentials: true,
  });

  Logger.log(`APP is listeninig to PORT {${process.env.APP_PORT}}`, 'Hesabyar');
  Logger.log(`APP is on {${process.env.NODE_ENV}} mode.`, 'Hesabyar');

  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
