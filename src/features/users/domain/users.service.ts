import { Inject, Injectable } from '@nestjs/common';
import { IUsersQueryRepository, IUsersRepository, IUsersService, UserQueryRepoKey, UserRepoKey } from '../types/common';
import { UserCreateModel, UserViewModel } from '../types/dto';
import { UsersDataMapper } from '../api/users.dm';
import { AbstractUsersService } from './users.auth.service';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { GMailSender } from '../../../application/mails/GMailSender';
import { UserServiceError } from '../types/errors';
import { UserEntityRepo } from '../dao/user-entity.repo';

@Injectable()
export class UsersService extends AbstractUsersService implements IUsersService {
  constructor(
    @Inject(UserRepoKey) private readonly usersRepo: IUsersRepository,
    @Inject(UserQueryRepoKey) private readonly usersQueryRepo: IUsersQueryRepository,
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

    const user: UserEntityRepo = await this.usersRepo.createUser({
      login: model.login,
      email: model.email,
      password: this.hashPassword(model.password),
      authConfirmation: this.createUserConfirmation(isUserConfirmed),
    });

    if (!isUserConfirmed) {
      await this.mailSender.sendRegistrationMail(user.email, user.authConfirmation.code).catch((e) => console.log(e));
    }

    result.setData(UsersDataMapper.toUserEntityView(user));

    return result;
  }
}
