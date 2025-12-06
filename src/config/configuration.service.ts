import { Injectable, Logger } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CryptoUtil } from 'src/common/utils/crypto.util';

@Injectable()
export class ConfigurationService {
  constructor() { }
  loadSepidarPassword(): string {
    const nodeEnv = process.env.HESABYAR_NODE_ENV + '' == 'developement' ? true : false;
    const secret = process.env.CONFIG_SECRET_KEY;
    if (!secret || secret.length == 0)
      Logger.error('SecretKey is empty', 'LoadSepidarPassword');
    const sepidarDbPassword = process.env.SEPDB_PASSWORD ?? '';
    if (nodeEnv)
      Logger.log(
        'Plane Sepidar password is: ' + sepidarDbPassword,
        'LoadSepidarPassword',
      );
    if (
      !secret ||
      secret.length == 0 ||
      !sepidarDbPassword ||
      sepidarDbPassword.length == 0
    )
      return '';
    if (sepidarDbPassword.length < 32) {
      Logger.error(
        'Sepidar password is not encrypted ' + sepidarDbPassword,
        'LoadSepidarPassword',
      );
      const sepidarEncryptedDbPassword = CryptoUtil.encrypt(
        sepidarDbPassword,
        secret,
      );
      Logger.log(
        'Encrypted Sepidar password is: ' + sepidarEncryptedDbPassword,
        'LoadSepidarPassword',
      );
      return '';
    }
    const sepidarEncryptedDbPassword = CryptoUtil.decrypt(
      sepidarDbPassword,
      secret,
    );

    if (nodeEnv)
      Logger.log(
        'Encrypted Sepidar password is: ' + sepidarEncryptedDbPassword,
      );
    return sepidarEncryptedDbPassword;
  }


  msSqlSepidarDbDatabase(): TypeOrmModuleOptions {
    const nodeEnv = process.env.HESABYAR_NODE_ENV + '' == 'developement' ? true : false;
    const msSqlpassword = this.loadSepidarPassword();
    const options: TypeOrmModuleOptions = {
      type: 'mssql',
      host: process.env.SEPDB_HOST,
      port: Number(process.env.SEPDB_PORT) ?? 1433,
      database: process.env.SEPDB_DBNAME,
      username: process.env.SEPDB_USERNAME,
      password: msSqlpassword,
      options: { encrypt: false, trustServerCertificate: true },
      autoLoadEntities: true,
      synchronize: false,
      logger: nodeEnv ? 'advanced-console' : 'simple-console',
      logging: nodeEnv ?? 'all',
    };
    if (nodeEnv) console.log(options);
    return options;
  }
  loadHesabyarDbPassword(): string {
    const nodeEnv = process.env.HESABYAR_NODE_ENV + '' == 'developement' ? true : false;
    const secret = process.env.CONFIG_SECRET_KEY;
    if (!secret || secret.length == 0)
      Logger.error('SecretKey is empty', 'loadHesabyarDbPassword');
    const hesabyarDbPassword = process.env.DB_PASSWORD ?? '';
    if (nodeEnv)
      Logger.log(
        'Plane Hesabyar password is: ' + hesabyarDbPassword,
        'loadHesabyarDbPassword',
      );
    if (
      !secret ||
      secret.length == 0 ||
      !hesabyarDbPassword ||
      hesabyarDbPassword.length == 0
    )
      return '';

    if (hesabyarDbPassword.length < 32) {
      Logger.error(
        'Hesabyar password is not encrypted ' + hesabyarDbPassword,
        'loadHesabyarDbPassword',
      );
      const sepidarEncryptedDbPassword = CryptoUtil.encrypt(
        hesabyarDbPassword,
        secret,
      );
      Logger.log(
        'Encrypted Hesabyar password is: ' + sepidarEncryptedDbPassword,
        'loadHesabyarDbPassword',
      );
      return '';
    }
    const hesabyarEncryptedDbPassword = CryptoUtil.decrypt(
      hesabyarDbPassword,
      secret,
    );

    if (nodeEnv)
      Logger.log(
        'Encrypted Hesabyar password is: ' + hesabyarDbPassword,
        'loadHesabyarDbPassword',
      );
    return hesabyarEncryptedDbPassword;
  }
  mySqlHesabyarDataBase(): TypeOrmModuleOptions {
    const nodeEnv = process.env.HESABYAR_NODE_ENV + '' == 'developement' ? true : false;
    const mySqlpassword = this.loadHesabyarDbPassword();
    const options: TypeOrmModuleOptions = {
      type: 'mysql',
      host: process.env.DB_HOST ?? '',
      port: Number(process.env.DB_PORT) ?? 3306,
      database: process.env.DB_NAME ?? '',
      username: process.env.DB_USERNAME ?? '',
      password: mySqlpassword,
      autoLoadEntities: true,
      synchronize: nodeEnv,
      logger: nodeEnv ? 'advanced-console' : 'simple-console',
      logging: nodeEnv ?? 'all',
    };
    if (nodeEnv) console.log(options);
    return options;
  }
}
