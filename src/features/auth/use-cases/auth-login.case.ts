import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AuthLoginInputModel } from '../types/dto';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { AuthAccessTokenPass, AuthRefreshTokenPass, AuthTokens } from '../utils/tokenCreator.types';
import { ObjectId } from 'mongodb';
import { UsersService } from '../../users/domain/users.service';
import { UsersRepository } from '../../users/dao/users.repository';
import { AuthSessionRepository } from '../dao/auth.repository';
import { AuthTokenCreator } from '../utils/tokenCreator';
import { AuthServiceError } from '../types/errors';

export class AuthLoginCommand {
  constructor(public readonly input: AuthLoginInputModel) {}
}

@CommandHandler(AuthLoginCommand)
export class AuthLoginCase implements ICommandHandler<AuthLoginCommand, ServiceResult<AuthTokens>> {
  constructor(
    private readonly userService: UsersService,
    private readonly usersRepo: UsersRepository,
    private readonly sessionRepo: AuthSessionRepository,
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

    const userId = user.id;

    const deviceId = new ObjectId();
    const accessToken: AuthAccessTokenPass = this.tokenCreator.createAccessToken(userId);
    const refreshToken: AuthRefreshTokenPass = this.tokenCreator.createRefreshToken(userId, deviceId.toString());

    await this.sessionRepo.createSession({
      deviceId: deviceId.toString(),
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
