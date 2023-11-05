import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRefreshTokenInputModel } from '../types/dto';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { AuthServiceError } from '../types/errors';
import { AuthAccessTokenPass, AuthRefreshTokenPass, AuthTokens } from '../utils/tokenCreator.types';
import { UsersService } from '../../users/domain/users.service';
import { AuthTokenCreator } from '../utils/tokenCreator';
import { Inject } from '@nestjs/common';
import { IUsersRepository, UserRepoKey } from '../../users/types/common';
import { AuthEntityRepo } from '../dao/auth-entity.repo';
import { AuthRepoKey, IAuthSessionRepository } from '../types/common';

export class AuthRefreshTokensCommand {
  constructor(public readonly input: AuthRefreshTokenInputModel) {}
}

@CommandHandler(AuthRefreshTokensCommand)
export class AuthRefreshTokensCase implements ICommandHandler<AuthRefreshTokensCommand, ServiceResult<AuthTokens>> {
  constructor(
    private readonly userService: UsersService,
    @Inject(UserRepoKey) private readonly usersRepo: IUsersRepository,
    @Inject(AuthRepoKey) private readonly authRepo: IAuthSessionRepository,
    private readonly tokenCreator: AuthTokenCreator,
  ) {}

  async execute({ input }: AuthRefreshTokensCommand): Promise<ServiceResult<AuthTokens>> {
    const result = new ServiceResult<AuthTokens>();
    const userId = input.userId;
    const userAgent = input.userAgent;
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

    const isSessionExist: boolean = await this.authRepo.isSessionByDeviceIdExist(deviceId);

    if (!isSessionExist) {
      result.addError({
        code: AuthServiceError.AUTH_SESSION_NOT_EXIST,
      });
      return result;
    }

    const accessToken: AuthAccessTokenPass = this.tokenCreator.createAccessToken(userId);
    const refreshToken: AuthRefreshTokenPass = this.tokenCreator.createRefreshToken(userId, deviceId);

    const authEntityRepo: AuthEntityRepo | null = await this.authRepo.getSessionByDeviceId(deviceId);

    if (authEntityRepo === null) {
      result.addError({
        code: AuthServiceError.AUTH_SESSION_NOT_UPDATED,
      });
      return result;
    }

    await authEntityRepo.updateSession({
      userAgent,
      ip: input.ip,
      uuid: refreshToken.uuid,
      lastActiveDate: refreshToken.expiredIn,
    });

    await authEntityRepo.save();

    result.setData({
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
    });

    return result;
  }
}
