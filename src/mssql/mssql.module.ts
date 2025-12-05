import { Module } from '@nestjs/common';
import { MssqlService } from './mssql.service';

import { TypeOrmModule } from '@nestjs/typeorm';
import { MssqlController } from './mssql.controller';
import { ConfigurationModule } from 'src/config/configuration.module';
import { ConfigurationService } from 'src/config/configuration.service';

@Module({
  imports: [
    ConfigurationModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigurationModule],
      inject: [ConfigurationService],
      name: 'mssqlConnection',
      useFactory: (config: ConfigurationService) =>
        config.msSqlSepidarDbDatabase(),
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
export class MssqlModule {}
