import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { AuthSession, AuthSessionSchema } from './dao/mongo/auth.schema';
import { AuthController } from './api/auth.controller';
import { AuthSessionService } from './domain/auth.service';
import { AuthMongoRepository } from './dao/mongo/auth.mongo.repository';
import { AuthMongoQueryRepository } from './dao/mongo/auth.mongo.query.repository';
import { AuthTokenCreator } from './utils/tokenCreator';
import { AuthSecurityController } from './api/auth.security.controller';
import { AuthTokenGuard } from '../../application/guards/AuthTokenGuard';
import { SharedModule } from '../../shared.module';
import { CqrsModule } from '@nestjs/cqrs';
import { authCases } from './use-cases';
import { GMailSender } from '../../application/mails/GMailSender';
import { withDbTypedClass, withDbTypedModule } from '../../application/utils/withTyped';
import { AuthRepoKey, AuthRepoQueryKey } from './types/common';
import { AuthSqlRawRepository } from './dao/sql-raw/auth.sql-raw.repository';
import { AuthSqlRawQueryRepository } from './dao/sql-raw/auth.sql-raw.query.repository';
import { AuthSqlOrmRepository } from './dao/sql-orm/auth.sql-orm.repository';
import { AuthSqlOrmQueryRepository } from './dao/sql-orm/auth.sql-orm.query.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthEntity } from './dao/sql-orm/auth.entity';

const AuthQueryRepoTyped = withDbTypedClass(AuthRepoQueryKey, {
  Mongo: AuthMongoQueryRepository,
  SQLRaw: AuthSqlRawQueryRepository,
  SQLOrm: AuthSqlOrmQueryRepository,
});
const AuthRepoTyped = withDbTypedClass(AuthRepoKey, { Mongo: AuthMongoRepository, SQLRaw: AuthSqlRawRepository, SQLOrm: AuthSqlOrmRepository });
const AuthDbModuleTyped = withDbTypedModule({
  Mongo: MongooseModule.forFeature([
    {
      name: AuthSession.name,
      schema: AuthSessionSchema,
    },
  ]),
  SQLOrm: TypeOrmModule.forFeature([AuthEntity]),
});

@Module({
  imports: [CqrsModule, AuthDbModuleTyped, UsersModule, SharedModule],
  controllers: [AuthController, AuthSecurityController],
  providers: [AuthRepoTyped, AuthQueryRepoTyped, AuthSessionService, AuthTokenCreator, AuthTokenGuard, GMailSender, ...authCases],
  exports: [AuthRepoTyped, AuthQueryRepoTyped],
})
export class AuthModule {}
