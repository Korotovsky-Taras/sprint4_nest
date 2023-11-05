import { INestApplication } from '@nestjs/common';
import { ITestingDaoUtils } from '../dao/types';
import { AuthTokenCreator } from '../../../src/features/auth/utils/tokenCreator';

export type AppConfig = {
  app: INestApplication;
  daoUtils: ITestingDaoUtils;
  tokenCreator: AuthTokenCreator;
  closeConnections: () => Promise<void>;
};
