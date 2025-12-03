import { Injectable } from '@nestjs/common';
import { CryptoUtil } from 'src/common/utils/crypto.util';

@Injectable()
export class ConfigurationService {
    constructor(private readonly secret = process.env.CONFIG_SECRET_KEY + '') {
    }

    // msSqlDatabase() {
    //     return {
    //         type: 'mssql',
    //         host: process.env.SEPDB_HOST,
    //         //port: configService.get('SEPDB_PORT'),
    //         database: process.env.SEPDB_DBNAME,
    //         username: process.env.SEPDB_USERNAME,
    //         password: CryptoUtil.decrypt(process.env.SEPDB_PASSWORD + '', this.secret),
    //         options: { encrypt: false, trustServerCertificate: true },
    //         autoLoadEntities: process.env.NODE_ENV == 'development' ? true : false,
    //         logger: 'advanced-console',
    //         logging: 'all',
    //     }
    //}
}
