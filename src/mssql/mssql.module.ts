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
  ],
  providers: [MssqlService],
  controllers: [MssqlController],
  exports: [MssqlService],
})
export class MssqlModule {}
