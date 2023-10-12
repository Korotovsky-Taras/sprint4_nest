import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthRefreshTokenInputModel } from '../types/dto';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { UsersRepository } from '../../users/dao/users.repository';
import { AuthSessionRepository } from '../dao/auth.repository';
import { AuthServiceError } from '../types/errors';
import { AuthAccessTokenPass, AuthRefreshTokenPass, AuthTokens } from '../utils/tokenCreator.types';
import { UsersService } from '../../users/domain/users.service';
import { AuthTokenCreator } from '../utils/tokenCreator';

export class AuthRefreshTokensCommand {
  constructor(public readonly input: AuthRefreshTokenInputModel) {}
}

@CommandHandler(AuthRefreshTokensCommand)
export class AuthRefreshTokensCase implements ICommandHandler<AuthRefreshTokensCommand, ServiceResult<AuthTokens>> {
  constructor(
    private readonly userService: UsersService,
    private readonly usersRepo: UsersRepository,
    private readonly sessionRepo: AuthSessionRepository,
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

    const isSessionExist: boolean = await this.sessionRepo.isSessionByDeviceIdExist(deviceId);

    if (!isSessionExist) {
      result.addError({
        code: AuthServiceError.AUTH_SESSION_NOT_EXIST,
      });
      return result;
    }

    const accessToken: AuthAccessTokenPass = this.tokenCreator.createAccessToken(userId);
    const refreshToken: AuthRefreshTokenPass = this.tokenCreator.createRefreshToken(userId, deviceId);

    const isUpdated = await this.sessionRepo.updateSession(deviceId, {
      userAgent,
      ip: input.ip,
      uuid: refreshToken.uuid,
      lastActiveDate: refreshToken.expiredIn,
    });

    if (!isUpdated) {
      result.addError({
        code: AuthServiceError.AUTH_SESSION_NOT_UPDATED,
      });
      return result;
    }

    result.setData({
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
    });

    return result;
  }
}
