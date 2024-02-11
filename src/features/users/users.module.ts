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
import { withTypedDbModule, withTypedRepository } from '../../application/utils/withTyped';
import { UserQueryRepoKey, UserRepoKey } from './types/common';
import { UsersSqlRawRepository } from './dao/sql-raw/users.sql-raw.repository';
import { UsersSqlRawQueryRepository } from './dao/sql-raw/users.sql-raw.query.repository';
import { UsersSqlOrmRepository } from './dao/sql-orm/users.sql-orm.repository';
import { UsersSqlOrmQueryRepository } from './dao/sql-orm/users.sql-orm.query.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from './dao/sql-orm/entities/users.entity';
import { UsersCredentialsEntity } from './dao/sql-orm/entities/users-credentials.entity';
import { UsersRecoveryConfirmationEntity } from './dao/sql-orm/entities/users-recovery-confirmation.entity';
import { UsersRegistrationConfirmationEntity } from './dao/sql-orm/entities/users-registration-confirmation.entity';

const UserQueryRepoTyped = withTypedRepository(UserQueryRepoKey, {
  Mongo: UsersMongoQueryRepository,
  SQLRaw: UsersSqlRawQueryRepository,
  SQLOrm: UsersSqlOrmQueryRepository,
});
const UserRepoTyped = withTypedRepository(UserRepoKey, { Mongo: UsersMongoRepository, SQLRaw: UsersSqlRawRepository, SQLOrm: UsersSqlOrmRepository });
const UserDbModuleTyped = withTypedDbModule({
  Mongo: MongooseModule.forFeature([
    {
      name: User.name,
      schema: UserSchema,
    },
  ]),
  SQLOrm: TypeOrmModule.forFeature([UsersEntity, UsersCredentialsEntity, UsersRecoveryConfirmationEntity, UsersRegistrationConfirmationEntity]),
});

@Module({
  imports: [CqrsModule, UserDbModuleTyped, SharedModule],
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
