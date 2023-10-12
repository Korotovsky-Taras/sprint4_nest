import { Injectable } from '@nestjs/common';
import { IUsersService } from '../types/common';
import { UserCreateModel, UserViewModel } from '../types/dto';
import { UsersRepository } from '../dao/users.repository';
import { UsersQueryRepository } from '../dao/users.query.repository';
import { UsersDataMapper } from '../api/users.dm';
import { AbstractUsersService } from './users.auth.service';
import { UserMongoType } from '../types/dao';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { GMailSender } from '../../../application/mails/GMailSender';
import { UserServiceError } from '../types/errors';

@Injectable()
export class UsersService extends AbstractUsersService implements IUsersService {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly usersQueryRepo: UsersQueryRepository,
    private readonly mailSender: GMailSender,
  ) {
    super();
  }

  async createUser(model: UserCreateModel, isUserConfirmed: boolean): Promise<ServiceResult<UserViewModel>> {
    const result = new ServiceResult<UserViewModel>();
    const isUserRegistered = await this.usersQueryRepo.isUserExistByLoginOrEmail(model.login, model.email);

    if (isUserRegistered) {
      result.addError({
        code: UserServiceError.USER_ALREADY_REGISTER,
      });
      return result;
    }

    const user: UserMongoType = await this.usersRepo.createUser({
      login: model.login,
      email: model.email,
      password: this.hashPassword(model.password),
      authConfirmation: this.createUserConfirmation(isUserConfirmed),
    });

    if (!isUserConfirmed) {
      await this.mailSender.sendRegistrationMail(user.email, user.authConfirmation.code).catch((e) => console.log(e));
    }

    result.setData(UsersDataMapper.toUserView(user));

    return result;
  }
}
