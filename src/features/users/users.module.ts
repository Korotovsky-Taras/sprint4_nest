import { Module } from '@nestjs/common';
import { UsersController } from './api/users.controller';
import { UsersService } from './domain/users.service';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './dao/users.schema';
import { UsersRepository } from './dao/users.repository';
import { UsersQueryRepository } from './dao/users.query.repository';

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
  providers: [UsersService, UsersRepository, UsersQueryRepository],
  exports: [UsersRepository, UsersQueryRepository],
})
export class UsersModule {}
