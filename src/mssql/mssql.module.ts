import { Module } from '@nestjs/common';
import { MssqlService } from './mssql.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { MssqlController } from './mssql.controller';
import { ConfigurationModule } from 'src/config/config.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ConfigurationService } from 'src/config/config.service';


@Module({
  imports: [
    ConfigModule, ConfigurationModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule, ConfigurationModule],
      inject: [ConfigService, ConfigurationService],
      name: 'mssqlConnection',
      useFactory: (config: ConfigService) => ({
        type: 'mssql',
        //password: configService.msSqlDatabase().password,
        host: config.get('SEPDB_HOST'),
        //port: configService.get('SEPDB_PORT'),
        database: config.get('SEPDB_DBNAME'),
        username: config.get('SEPDB_USERNAME'),
        options: { encrypt: false, trustServerCertificate: true },
        autoLoadEntities: config.get('NODE_ENV') == 'development' ? true : false,
        logger: 'advanced-console',
        logging: 'all',
      })
    }),
    // TypeOrmModule.forRootAsync({
    //   imports: [ConfigModule],
    //   inject: [ConfigService],
    //   name: 'mssqlConnection',
    //   useFactory: (configService: ConfigService) => ({
    //     type: 'mssql',
    //     host: configService.get('SEPDB_HOST'),
    //     //port: configService.get('SEPDB_PORT'),
    //     database: configService.get('SEPDB_DBNAME'),
    //     username: configService.get('SEPDB_USERNAME'),
    //     password: //CryptoUtil.decrypt(configService.get('DB_PASSWORD') + '', configService.get('CONFIG_SECRET_KEY') + ''),
    //       configService.get('SEPDB_PASSWORD'),
    //     options: { encrypt: false, trustServerCertificate: true },
    //     autoLoadEntities: configService.get('NODE_ENV') == 'development' ? true : false,
    //     logger: 'advanced-console',
    //     logging: 'all',
    //   }),
    // }),
  ],
  providers: [MssqlService],
  controllers: [MssqlController],
  exports: [MssqlService],
})
export class MssqlModule { }
