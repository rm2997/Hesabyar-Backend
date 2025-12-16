import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const nodeEnv =
    process.env.HESABYAR_NODE_ENV + '' == 'developement' ? true : false;
  const nodeEnvStr = nodeEnv ? 'developement' : 'production';
  const appPort = process.env.APP_PORT ?? 3000;
  Logger.log(`APP is listeninig to PORT ${appPort}`, 'Hesabyar');
  Logger.log(`APP is on ${nodeEnvStr} mode.`, 'Hesabyar');
  Logger.log(`APP Release Date: 14040925`, 'Hesabyar');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const frontWhiteList = [
    'https://www.hesab-yaar.ir',
    'https://hesab-yaar.ir',
    'http://localhost:3000',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (frontWhiteList.includes(origin)) {
        Logger.log(
          `Allowed CORS for: ${origin} - ${new Date()}`,
          'HESABYAR-CORS',
        );
        return callback(null, origin);
      } else {
        Logger.error(
          `Blocked CORS for: ${origin} - ${new Date()}`,
          'HESABYAR-CORS',
        );
        return callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });

  await app.listen(appPort);
}
bootstrap();
