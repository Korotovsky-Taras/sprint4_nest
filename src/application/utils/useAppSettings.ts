import cookieParser from 'cookie-parser';
import { INestApplication, Logger } from '@nestjs/common';
import { ClassValidationPipe } from '../pipes/ClassValidationPipe';
import { HttpExceptionFilter } from '../filters/HttpExceptionFilter';
import { ServerExceptionFilter } from '../filters/ServerExceptionFilter';
import { useContainer } from 'class-validator';
import { AppModule } from '../../app.module';
import { ConfigService } from '@nestjs/config';

export function useAppSettings(app: INestApplication) {
  const configService = app.get<ConfigService>(ConfigService);
  app.enableCors();
  app.use(cookieParser());
  app.useGlobalPipes(new ClassValidationPipe());
  app.useGlobalFilters(new ServerExceptionFilter(configService, new Logger()), new HttpExceptionFilter());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
}
