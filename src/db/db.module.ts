import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { appConfig } from '../application/utils/config';
import { ServerApiVersion } from 'mongodb';
import { Connection } from 'mongoose';
import { DBService } from './DBService';

@Module({
  imports: [
    MongooseModule.forRoot(appConfig.mongoUrl, {
      w: 'majority',
      retryWrites: true,
      maxPoolSize: 20,
      dbName: appConfig.dbName,
      serverApi: {
        version: ServerApiVersion.v1,
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
    }),
  ],
  providers: [DBService],
})
export class DbModule {}
