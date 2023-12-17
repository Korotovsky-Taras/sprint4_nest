import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthLoginInputModel } from '../types/dto';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { AuthAccessTokenPass, AuthRefreshTokenPass, AuthTokens } from '../utils/tokenCreator.types';
import { UsersService } from '../../users/domain/users.service';
import { AuthTokenCreator } from '../utils/tokenCreator';
import { AuthServiceError } from '../types/errors';
import { IUsersRepository, UserRepoKey } from '../../users/types/common';
import { Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { AuthRepoKey, IAuthSessionRepository } from '../types/common';

export class AuthLoginCommand {
  constructor(public readonly input: AuthLoginInputModel) {}
}

@CommandHandler(AuthLoginCommand)
export class AuthLoginCase implements ICommandHandler<AuthLoginCommand, ServiceResult<AuthTokens>> {
  constructor(
    private readonly userService: UsersService,
    @Inject(UserRepoKey) private readonly usersRepo: IUsersRepository<any>,
    @Inject(AuthRepoKey) private readonly authRepo: IAuthSessionRepository<any>,
    private readonly tokenCreator: AuthTokenCreator,
  ) {}

  async execute({ input }: AuthLoginCommand): Promise<ServiceResult<AuthTokens>> {
    const result = new ServiceResult<AuthTokens>();
    const user = await this.usersRepo.getUserByLoginOrEmail(input.loginOrEmail, input.loginOrEmail);

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

    const isVerified = this.userService.verifyPassword(input.password, user.password.salt, user.password.hash);

    if (!isVerified) {
      result.addError({
        code: AuthServiceError.AUTH_USER_PASS_NOT_VERIFIED,
      });
      return result;
    }

    const userId = user._id;

    const deviceId = randomUUID();
    const accessToken: AuthAccessTokenPass = this.tokenCreator.createAccessToken(userId);
    const refreshToken: AuthRefreshTokenPass = this.tokenCreator.createRefreshToken(userId, deviceId);

    await this.authRepo.createSession({
      deviceId,
      userId,
      userAgent: input.userAgent,
      ip: input.ip,
      uuid: refreshToken.uuid,
      lastActiveDate: refreshToken.expiredIn,
    });

    result.setData({
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
    });
    return result;
  }
}
