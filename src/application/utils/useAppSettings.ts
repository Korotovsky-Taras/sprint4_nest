import cookieParser from 'cookie-parser';
import { INestApplication, Logger } from '@nestjs/common';
import { ClassValidationPipe } from '../pipes/ClassValidationPipe';
import { HttpExceptionFilter } from '../filters/HttpExceptionFilter';
import { ServerExceptionFilter } from '../filters/ServerExceptionFilter';
import { useContainer } from 'class-validator';
import { AppModule } from '../../app.module';
import { AppConfigService } from '../../app.config.service';

export function useAppSettings(app: INestApplication) {
  const appConfigService = app.get<AppConfigService>(AppConfigService);
  app.enableCors();
  app.use(cookieParser());
  app.useGlobalPipes(new ClassValidationPipe());
  app.useGlobalFilters(new ServerExceptionFilter(appConfigService, new Logger()), new HttpExceptionFilter(appConfigService));

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
}
