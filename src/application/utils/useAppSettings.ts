import cookieParser from 'cookie-parser';
import { INestApplication } from '@nestjs/common';
import { ClassValidationPipe } from '../pipes/ClassValidationPipe';
import { HttpExceptionFilter } from '../filters/HttpExceptionFilter';
import { ServerExceptionFilter } from '../filters/ServerExceptionFilter';
import { useContainer } from 'class-validator';
import { AppModule } from '../../app.module';

export function useAppSettings(app: INestApplication) {
  app.enableCors();
  app.use(cookieParser());
  app.useGlobalPipes(new ClassValidationPipe());
  app.useGlobalFilters(new ServerExceptionFilter(), new HttpExceptionFilter());

  useContainer(app.select(AppModule), { fallbackOnErrors: true });
}
