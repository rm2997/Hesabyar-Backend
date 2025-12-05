import { Injectable, Logger } from '@nestjs/common';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { CryptoUtil } from 'src/common/utils/crypto.util';

@Injectable()
export class ConfigurationService {
  constructor() {}
  loadSepidarPassword(): string {
    const secret = process.env.CONFIG_SECRET_KEY;
    const sepidarDbPassword = process.env.SEPDB_PASSWORD ?? '';
    if (!secret || secret.length == 0) return '';
    return CryptoUtil.decrypt(sepidarDbPassword, secret);
  }
  msSqlSepidarDbDatabase(): TypeOrmModuleOptions {
    const options: TypeOrmModuleOptions = {
      type: 'mssql',
      host: process.env.SEPDB_HOST,
      port: Number(process.env.SEPDB_PORT) ?? 1433,
      database: process.env.SEPDB_DBNAME,
      username: process.env.SEPDB_USERNAME,
      password: this.loadSepidarPassword(),
      options: { encrypt: false, trustServerCertificate: true },
      autoLoadEntities: process.env.NODE_ENV == 'development' ? true : false,
      logger: 'advanced-console',
      logging: 'all',
    };
    //console.log(options);
    return options;
  }
  loadHesabyarDbPassword(): string {
    const secret = process.env.CONFIG_SECRET_KEY;
    const sepidarDbPassword = process.env.DB_PASSWORD ?? '';
    if (!secret || secret.length == 0) return '';
    return CryptoUtil.decrypt(sepidarDbPassword, secret);
  }
  mySqlHesabyarDataBase(): TypeOrmModuleOptions {
    const options: TypeOrmModuleOptions = {
      type: 'mysql',
      host: process.env.DB_HOST ?? '',
      port: Number(process.env.DB_PORT) ?? 3306,
      database: process.env.DB_NAME ?? '',
      username: process.env.DB_USERNAME ?? '',
      password: this.loadHesabyarDbPassword(),
      autoLoadEntities: process.env.NODE_ENV == 'developement' ? true : false,
      synchronize: process.env.NODE_ENV == 'developement' ? true : false,
      logger: 'advanced-console',
      logging: 'all',
    };
    //console.log(options);
    return options;
  }
}
