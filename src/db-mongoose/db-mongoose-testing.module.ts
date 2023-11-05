import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfiguration } from '../application/utils/config';
import { Connection } from 'mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DbMongooseService } from './db-mongoose.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfiguration, true>) => {
        const mongoEnvs = configService.get('mongo', { infer: true });
        return {
          uri: mongoEnvs.TEST_URI,
          w: 'majority',
          retryWrites: true,
          maxPoolSize: 20,
          dbName: mongoEnvs.DB_NAME,
          serverApi: {
            version: mongoEnvs.DB_VER,
            strict: true,
            deprecationErrors: true,
          },
          connectionFactory: (connection: Connection) => {
            if (connection.readyState === 1) {
              Logger.log('DB connected');
            }
            connection.on('disconnected', () => {
              Logger.log('DB disconnected');
            });
            return connection;
          },
        };
      },
    }),
  ],
  providers: [DbMongooseService],
})
export class DbMongooseTestingModule {}
