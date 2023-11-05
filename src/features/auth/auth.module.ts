import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { AuthSession, AuthSessionSchema } from './dao/mongo/auth.schema';
import { AuthController } from './api/auth.controller';
import { AuthSessionService } from './domain/auth.service';
import { AuthSessionRepository } from './dao/mongo/auth.mongo.repository';
import { AuthSessionQueryRepository } from './dao/mongo/auth.mongo.query.repository';
import { AuthTokenCreator } from './utils/tokenCreator';
import { AuthSecurityController } from './api/auth.security.controller';
import { AuthTokenGuard } from '../../application/guards/AuthTokenGuard';
import { SharedModule } from '../../shared.module';
import { CqrsModule } from '@nestjs/cqrs';
import { authCases } from './use-cases';
import { GMailSender } from '../../application/mails/GMailSender';
import { withDbTypedClass } from '../../application/utils/withTypedClass';
import { AuthRepoKey, AuthRepoQueryKey } from './types/common';
import { AuthRawSqlSessionRepository } from './dao/sql-raw/auth.raw-sql.repository';
import { AuthRawSqlSessionQueryRepository } from './dao/sql-raw/auth.raw-sql.query.repository';

const AuthQueryRepoTyped = withDbTypedClass(AuthRepoQueryKey, { Mongo: AuthSessionQueryRepository, SQLRaw: AuthRawSqlSessionQueryRepository });
const AuthRepoTyped = withDbTypedClass(AuthRepoKey, { Mongo: AuthSessionRepository, SQLRaw: AuthRawSqlSessionRepository });

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      {
        name: AuthSession.name,
        schema: AuthSessionSchema,
      },
    ]),
    UsersModule,
    SharedModule,
  ],
  controllers: [AuthController, AuthSecurityController],
  providers: [AuthRepoTyped, AuthQueryRepoTyped, AuthSessionService, AuthTokenCreator, AuthTokenGuard, GMailSender, ...authCases],
  exports: [AuthRepoTyped, AuthQueryRepoTyped],
})
export class AuthModule {}
