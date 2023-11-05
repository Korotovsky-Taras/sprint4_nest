import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfiguration } from '../application/utils/config';
import { Connection } from 'mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
import { DbMongooseService } from './db-mongoose.service';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<AppConfiguration, true>) => {
        const mongoEnv = configService.get('mongo', { infer: true });
        return {
          uri: mongoEnv.URI,
          w: 'majority',
          retryWrites: true,
          maxPoolSize: 20,
          dbName: mongoEnv.DB_NAME,
          serverApi: {
            version: mongoEnv.DB_VER,
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
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory(configService: ConfigService<AppConfiguration, true>): Promise<TypeOrmModuleOptions> | TypeOrmModuleOptions {
        const env = configService.get('sql', { infer: true });
        return {
          type: 'postgres',
          host: env.DB_HOST,
          port: env.DB_PORT,
          username: env.DB_USER,
          password: env.DB_PASS,
          database: env.DB_NAME,
          autoLoadEntities: false,
          synchronize: false,
        };
      },
    }),
  ],
  providers: [DbMongooseService],
})
export class DbModule {}
