import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from '../users/users.module';
import { AuthSession, AuthSessionSchema } from './dao/auth.schema';
import { AuthController } from './api/auth.controller';
import { AuthSessionService } from './domain/auth.service';
import { AuthSessionRepository } from './dao/auth.repository';
import { AuthSessionQueryRepository } from './dao/auth.query.repository';
import { AuthTokenCreator } from './utils/tokenCreator';
import { AuthSecurityController } from './api/auth.security.controller';
import { AuthTokenGuard } from '../../application/guards/AuthTokenGuard';
import { SharedModule } from '../../shared.module';
import { CqrsModule } from '@nestjs/cqrs';
import { authCases } from './use-cases';
import { GMailSender } from '../../application/mails/GMailSender';

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
  providers: [AuthSessionService, AuthSessionRepository, AuthSessionQueryRepository, AuthTokenCreator, AuthTokenGuard, GMailSender, ...authCases],
  exports: [AuthSessionRepository, AuthSessionQueryRepository],
})
export class AuthModule {}
