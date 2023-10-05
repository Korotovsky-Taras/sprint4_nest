import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { UsersService } from './domain/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './dao/users.schema';
import { UsersRepository } from './dao/users.repository';
import { UsersQueryRepository } from './dao/users.query.repository';
import { IsUniqueUserEmailValidator } from '../../application/decorators/validation/IsUniqueUserEmail';
import { IsAuthConfirmationCodeValidator } from '../../application/decorators/validation/IsAuthConfirmationCodeValid';
import { IsAuthEmailResendingValidator } from '../../application/decorators/validation/IsAuthEmailResendingValid';
import { IsUniqueUserLoginValidator } from '../../application/decorators/validation/IsUniqueUserLogin';
import { SharedModule } from '../../shared.module';
import { GMailSender } from '../../application/mails/GMailSender';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
    SharedModule,
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersRepository,
    UsersQueryRepository,
    IsUniqueUserEmailValidator,
    IsUniqueUserLoginValidator,
    IsAuthConfirmationCodeValidator,
    IsAuthEmailResendingValidator,
    GMailSender,
  ],
  exports: [UsersService, UsersRepository, UsersQueryRepository],
})
export class UsersModule {}
