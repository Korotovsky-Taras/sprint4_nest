import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthSessionInfoModel } from '../types/dto';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { UsersRepository } from '../../users/dao/users.repository';
import { AuthSessionRepository } from '../dao/auth.repository';
import { AuthServiceError } from '../types/errors';

export class AuthLogoutCommand {
  constructor(public readonly input: AuthSessionInfoModel) {}
}

@CommandHandler(AuthLogoutCommand)
export class AuthLogoutCase implements ICommandHandler<AuthLogoutCommand, ServiceResult> {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly sessionRepo: AuthSessionRepository,
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

    await this.sessionRepo.deleteSession({ userId, deviceId });

    return result;
  }
}
