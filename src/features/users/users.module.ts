import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { UsersService } from './domain/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './dao/users.schema';
import { UsersRepository } from './dao/users.repository';
import { UsersQueryRepository } from './dao/users.query.repository';
import { MailSender } from '../../application/mailSender';
import { MailAdapter } from '../../application/adapters/mail.adapter';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [MailSender, MailAdapter, UsersService, UsersRepository, UsersQueryRepository],
  exports: [UsersService, UsersRepository, UsersQueryRepository],
})
export class UsersModule {}
