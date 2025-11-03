import { Module } from '@nestjs/common';
import { MssqlService } from './mssql.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MssqlController } from './mssql.controller';

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      name: 'mssqlConnection',
      useFactory: (configService: ConfigService) => ({
        type: 'mssql',
        host: configService.get('SEPDB_HOST'),
        //port: configService.get('SEPDB_PORT'),
        database: configService.get('SEPDB_DBNAME'),
        username: configService.get('SEPDB_USERNAME'),
        password: configService.get('SEPDB_PASSWORD'),
        options: { encrypt: false, trustServerCertificate: true },
        autoLoadEntities: true,
      }),
    }),
  ],
  providers: [MssqlService],
  controllers: [MssqlController],
  exports: [MssqlService],
})
export class MssqlModule {}
