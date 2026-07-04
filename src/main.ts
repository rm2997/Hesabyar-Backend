import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Logger, UnauthorizedException } from '@nestjs/common';

async function bootstrap() {
  const nodeEnv =
    process.env.ASANSORLAND_NODE_ENV + '' == 'developement' ? true : false;
  const version = 'v1.0 - 14050509';
  const nodeEnvStr = nodeEnv ? 'developement' : 'production';
  const appPort = process.env.APP_PORT ?? 3000;
  Logger.log(`APP is listeninig to PORT [${appPort}]`, 'ASANSORLAND');
  Logger.log(`APP is on ${nodeEnvStr} mode.`, 'ASANSORLAND');

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  // const frontWhiteList = [
  //   'https://www.asansorlands.ir',
  //   'http://www.asansorlands.ir',
  //   'http://localhost:3000',
  // ];
const frontWhiteList = process.env.ASANSORLAND_WHITE_LIST?.split(',').map(x=>x.trim()).filter(Boolean)??[]
  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (frontWhiteList.includes(origin)) {
        if (nodeEnv)
          Logger.log(
            `Allowed CORS for: ${origin} - ${new Date()}`,
            'ASANSORLAND-CORS',
          );
        return callback(null, origin);
      } else {
        Logger.debug(
          `Blocked CORS for: [${origin}] - [${new Date()}`,
          'ASANSORLAND-CORS',
        );
        return callback(
          new UnauthorizedException(
            `به دلایل امنیتی امکان پاسخگویی به آدرس شما وجود ندارد`,
          ),
        );
      }
    },
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  });
  Logger.debug(`APP Release [${version}]`, 'ASANSORLAND');
  Logger.debug(`Front white list [${frontWhiteList}]`, 'ASANSORLAND');
  await app.listen(appPort);
}
bootstrap();
