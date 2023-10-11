import { ConfigModule } from '@nestjs/config';
import { getConfiguration, getEnvFilePath } from './application/utils/config';

export const configModule = ConfigModule.forRoot({
  isGlobal: true,
  envFilePath: getEnvFilePath(),
  load: [getConfiguration],
});
