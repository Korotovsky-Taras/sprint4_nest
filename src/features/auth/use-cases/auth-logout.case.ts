import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthSessionInfoModel } from '../types/dto';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { AuthServiceError } from '../types/errors';
import { Inject } from '@nestjs/common';
import { IUsersRepository, UserRepoKey } from '../../users/types/common';
import { AuthRepoKey, IAuthSessionRepository } from '../types/common';

export class AuthLogoutCommand {
  constructor(public readonly input: AuthSessionInfoModel) {}
}

@CommandHandler(AuthLogoutCommand)
export class AuthLogoutCase implements ICommandHandler<AuthLogoutCommand, ServiceResult> {
  constructor(
    @Inject(UserRepoKey) private readonly usersRepo: IUsersRepository,
    @Inject(AuthRepoKey) private readonly authRepo: IAuthSessionRepository,
  ) {}

  async execute({ input }: AuthLogoutCommand): Promise<ServiceResult> {
    const result = new ServiceResult();

    const userId = input.userId;
    const deviceId = input.deviceId;
    const user = await this.usersRepo.getUserById(userId);

    if (!user) {
      result.addError({
        code: AuthServiceError.AUTH_USER_NO_FOUND,
      });
      return result;
    }

    if (!user.isAuthConfirmed()) {
      result.addError({
        code: AuthServiceError.AUTH_USER_NOT_CONFIRMED,
      });
      return result;
    }

    await this.authRepo.deleteSession({ userId, deviceId });

    return result;
  }
}
