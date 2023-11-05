import { Module } from '@nestjs/common';
import { UsersAdminController } from './api/users.admin.controller';
import { UsersService } from './domain/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './dao/mongo/users.schema';
import { UsersMongoRepository } from './dao/mongo/users.mongo.repository';
import { UsersMongoQueryRepository } from './dao/mongo/users.mongo.query.repository';
import { IsUniqueUserEmailValidator } from '../../application/decorators/validation/IsUniqueUserEmail';
import { IsAuthConfirmationCodeValidator } from '../../application/decorators/validation/IsAuthConfirmationCodeValid';
import { IsAuthEmailResendingValidator } from '../../application/decorators/validation/IsAuthEmailResendingValid';
import { IsUniqueUserLoginValidator } from '../../application/decorators/validation/IsUniqueUserLogin';
import { SharedModule } from '../../shared.module';
import { GMailSender } from '../../application/mails/GMailSender';
import { CqrsModule } from '@nestjs/cqrs';
import { userCases } from './use-cases';
import { withDbTypedClass } from '../../application/utils/withTypedClass';
import { UserQueryRepoKey, UserRepoKey } from './types/common';
import { UsersSqlRawRepository } from './dao/sql-raw/users.sql-raw.repository';
import { UsersSqlRawQueryRepository } from './dao/sql-raw/users.sql-raw.query.repository';

const UserQueryRepoTyped = withDbTypedClass(UserQueryRepoKey, { Mongo: UsersMongoQueryRepository, SQLRaw: UsersSqlRawQueryRepository });
const UserRepoTyped = withDbTypedClass(UserRepoKey, { Mongo: UsersMongoRepository, SQLRaw: UsersSqlRawRepository });

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    SharedModule,
  ],
  controllers: [UsersAdminController],
  providers: [
    UsersService,
    UserRepoTyped,
    UserQueryRepoTyped,
    IsUniqueUserEmailValidator,
    IsUniqueUserLoginValidator,
    IsAuthConfirmationCodeValidator,
    IsAuthEmailResendingValidator,
    GMailSender,
    ...userCases,
  ],
  exports: [UsersService, UserRepoTyped, UserQueryRepoTyped],
})
export class UsersModule {}
