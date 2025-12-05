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

  const secret = process.env.CONFIG_SECRET_KEY + '';
  let encrypted = CryptoUtil.encrypt(process.env.SEPDB_PASSWORD + '', secret);
  if (process.env.NODE_ENV == 'developement')
    console.log('Encrypted:', encrypted);
  let decrypted = CryptoUtil.decrypt(encrypted, secret);
  console.log('Decrypted:', decrypted);

  encrypted = CryptoUtil.encrypt(process.env.DB_PASSWORD + '', secret);
  if (process.env.NODE_ENV == 'developement')
    console.log('Encrypted:', encrypted);
  decrypted = CryptoUtil.decrypt(encrypted, secret);
  if (process.env.NODE_ENV == 'developement')
    console.log('Decrypted:', decrypted);

  // encrypted = CryptoUtil.encrypt(process.env.USER_LINK_SECRET + '', secret);
  // console.log('Encrypted:', encrypted);
  // decrypted = CryptoUtil.decrypt(encrypted, secret);
  // console.log('Decrypted:', decrypted);

  // encrypted = CryptoUtil.encrypt(process.env.PROFORMA_LINK_SECRET + '', secret);
  // console.log('Encrypted:', encrypted);
  // decrypted = CryptoUtil.decrypt(encrypted, secret);
  // console.log('Decrypted:', decrypted);

  // encrypted = CryptoUtil.encrypt(process.env.INVOICE_LINK_SECRET + '', secret);
  // console.log('Encrypted:', encrypted);
  // decrypted = CryptoUtil.decrypt(encrypted, secret);
  // console.log('Decrypted:', decrypted);

  // encrypted = CryptoUtil.encrypt(process.env.DEPOT_LINK_SECRET + '', secret);
  // console.log('Encrypted:', encrypted);
  // decrypted = CryptoUtil.decrypt(encrypted, secret);
  // console.log('Decrypted:', decrypted);

  // encrypted = CryptoUtil.encrypt('C@rdOp*1404*', secret);
  // console.log('Encrypted:', encrypted);
  // decrypted = CryptoUtil.decrypt(encrypted, secret);
  // console.log('Decrypted:', decrypted);

  await app.listen(process.env.APP_PORT || 3000);
}
bootstrap();
