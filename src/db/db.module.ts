import { Logger, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppConfiguration } from '../application/utils/config';
import { Connection } from 'mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm/dist/interfaces/typeorm-options.interface';
import { DbSqlService } from './db-sql/db-sql.service';
import { withTypedDbModule, withTypedDbProvider } from '../application/utils/withTyped';
import { QuizGameQuestionsSubscriber } from '../features/quiz_game/dao/sql-orm/entities/quiz-game-questions.subscriber';
import { DbMongooseService } from './db-mongoose/db-mongoose.service';

function createSqlDB() {
  return TypeOrmModule.forRootAsync({
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
        ssl: env.DB_SSL,
        autoLoadEntities: env.DB_AUTOLOAD_ENTITIES,
        synchronize: env.DB_SYNCHRONIZE,
        subscribers: [QuizGameQuestionsSubscriber],
      };
    },
  });
}

const TypedDbModule = withTypedDbModule({
  Mongo: MongooseModule.forRootAsync({
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
            Logger.log('MongoDB connected');
          }
          connection.on('disconnected', () => {
            Logger.log('MongoDB disconnected');
          });
          return connection;
        },
      };
    },
  }),
  SQLOrm: createSqlDB(),
  SQLRaw: createSqlDB(),
});

const TypedDbProviders = withTypedDbProvider({
  Mongo: DbMongooseService,
  SQLRaw: DbSqlService,
  SQLOrm: DbSqlService,
});

@Module({
  imports: [TypedDbModule],
  providers: [TypedDbProviders],
})
export class DbModule {}
