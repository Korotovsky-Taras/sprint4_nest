import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import { useAppSettings } from './application/utils/useAppSettings';
import { WinstonModule } from 'nest-winston';
import { format, transports } from 'winston';
import { clearLogs } from './application/utils/clearLogs';

async function bootstrap() {
  await clearLogs();

  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger({
      transports: [
        new transports.File({
          filename: `public/logs/error.txt`,
          level: 'error',
          format: format.combine(format.timestamp(), format.json()),
        }),
        new transports.File({
          filename: `public/logs/combined.txt`,
          format: format.combine(format.timestamp(), format.json()),
        }),
        new transports.Console({
          format: format.combine(
            format.cli(),
            format.splat(),
            format.timestamp(),
            format.printf((info) => {
              return `${info.timestamp} ${info.level}: ${info.message}`;
            }),
          ),
        }),
      ],
    }),
  });
  useAppSettings(app);
  await app.listen(3000);
}

bootstrap();
