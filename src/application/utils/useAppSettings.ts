import cookieParser from 'cookie-parser';
import { INestApplication } from '@nestjs/common';

export function useAppSettings(app: INestApplication) {
  app.enableCors();
  app.use(cookieParser());
  app.useGlobalFilters();
}
