import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const nodeEnv =
    process.env.ASANSORLAND_NODE_ENV + '' == 'developement' ? true : false;
  const nodeEnvStr = nodeEnv ? 'developement' : 'production';
  const appPort = process.env.APP_PORT ?? 3000;
  Logger.log(`APP is listeninig to PORT ${appPort}`, 'ASANSORLAND');
  Logger.log(`APP is on ${nodeEnvStr} mode.`, 'ASANSORLAND');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const frontWhiteList = [
    'https://www.asansorlands.ir',
    'http://localhost:3000',
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (frontWhiteList.includes(origin)) {
        Logger.log(
          `Allowed CORS for: ${origin} - ${new Date()}`,
          'ASANSORLAND-CORS',
        );
        return callback(null, origin);
      } else {
        Logger.error(
          `Blocked CORS for: ${origin} - ${new Date()}`,
          'ASANSORLAND-CORS',
        );
        return callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  Logger.log(`APP Release Date: 14041017`, 'ASANSORLAND');
  await app.listen(appPort);
}
bootstrap();
