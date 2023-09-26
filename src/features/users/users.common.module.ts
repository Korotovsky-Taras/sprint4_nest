import { Module } from '@nestjs/common';
import { UsersQueryRepository } from './dao/users.query.repository';
import { UsersDataMapper } from './api/users.dm';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './dao/users.schema';
import { UsersRepository } from './dao/users.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  providers: [],
  exports: [UsersRepository, UsersQueryRepository, UsersDataMapper],
})
export class UsersCommonModule {}
