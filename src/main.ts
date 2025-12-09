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
  Logger.log(`APP Release Date: 14040918`, 'Hesabyar');
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const frontWhiteList = [
    'https://hesab-yaar.ir',
    'https://www.hesab-yaar.ir',
    `https://localhost:3000`,
    `http://localhost:3000`,
  ];

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin || frontWhiteList.indexOf(origin) >= 0) {
        if (nodeEnv)
          Logger.log(
            `Allowed cors for: ${origin} - ${Date()}`,
            'HESABYAR-CORS',
          );
        callback(null, origin);
      } else {
        Logger.error(
          `Not allowed cors for: ${origin} - ${Date()}`,
          'HESABYAR-CORS',
        );
        callback(new Error('Not allowed by CORS!'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    allowedHeaders: '*',
    credentials: true,
  });

  await app.listen(appPort);
}
bootstrap();
