import { Injectable } from '@nestjs/common';
import { UsersRepository } from '../../users/dao/users.repository';
import { AuthSessionRepository } from '../dao/auth.repository';
import { UsersQueryRepository } from '../../users/dao/users.query.repository';
import { IAuthSessionService } from '../types/common';
import { UsersDataMapper } from '../../users/api/users.dm';
import { AuthLoginInputDto, AuthRefreshTokenInputDto, AuthSessionLogoutInputDto } from '../types/dto';
import { AuthAccessTokenPass, AuthRefreshTokenPass, AuthTokens } from '../utils/tokenCreator.types';
import { AuthTokenCreator } from '../utils/tokenCreator';
import { UsersService } from '../../users/domain/users.service';
import { AuthSessionQueryRepository } from '../dao/auth.query.repository';
import { ObjectId } from 'mongodb';

@Injectable()
export class AuthSessionService implements IAuthSessionService {
  constructor(
    private readonly userService: UsersService,
    private readonly usersRepo: UsersRepository,
    private readonly usersQueryRepo: UsersQueryRepository,
    private readonly sessionRepo: AuthSessionRepository,
    private readonly sessionQueryRepo: AuthSessionQueryRepository,
    private readonly tokenCreator: AuthTokenCreator,
  ) {}

  async login(model: AuthLoginInputDto): Promise<AuthTokens | null> {
    const user = await this.usersQueryRepo.getUserByLoginOrEmail(model.loginOrEmail, model.loginOrEmail, UsersDataMapper.toUserAuthWithConfirmation);

    if (!user) {
      return null;
    }

    const isConfirmed: boolean = user.confirmed;

    if (!isConfirmed) {
      return null;
    }

    const isVerified = this.userService._verifyPassword(model.password, user.password.salt, user.password.hash);

    if (!isVerified) {
      return null;
    }

    const userId = user.id;

    const deviceId = new ObjectId();
    const accessToken: AuthAccessTokenPass = this.tokenCreator.createAccessToken(userId);
    const refreshToken: AuthRefreshTokenPass = this.tokenCreator.createRefreshToken(userId, deviceId.toString());

    await this.sessionRepo.createSession({
      deviceId: deviceId.toString(),
      userId,
      userAgent: model.userAgent,
      ip: model.ip,
      uuid: refreshToken.uuid,
      lastActiveDate: refreshToken.expiredIn,
    });

    return {
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
    };
  }

  async logout(input: AuthSessionLogoutInputDto): Promise<boolean> {
    const userId = input.userId;
    const deviceId = input.deviceId;
    const isUserAuthConfirmed: boolean = await this.usersQueryRepo.isUserAuthConfirmed(userId);

    if (!isUserAuthConfirmed) {
      return false;
    }

    return await this.sessionRepo.deleteSession({ userId, deviceId });
  }

  async refreshTokens(model: AuthRefreshTokenInputDto): Promise<AuthTokens | null> {
    const userId = model.userId;
    const userAgent = model.userAgent;
    const deviceId = model.deviceId;

    const isUserAuthConfirmed: boolean = await this.usersQueryRepo.isUserAuthConfirmed(userId);

    if (!isUserAuthConfirmed) {
      return null;
    }

    const isSessionExist: boolean = await this.sessionQueryRepo.isSessionByDeviceIdExist(deviceId);

    if (!isSessionExist) {
      return null;
    }

    const accessToken: AuthAccessTokenPass = this.tokenCreator.createAccessToken(userId);
    const refreshToken: AuthRefreshTokenPass = this.tokenCreator.createRefreshToken(userId, deviceId);

    const isUpdated = await this.sessionRepo.updateSession(deviceId, {
      userAgent,
      ip: model.ip,
      uuid: refreshToken.uuid,
      lastActiveDate: refreshToken.expiredIn,
    });

    if (!isUpdated) {
      return null;
    }

    return {
      accessToken: accessToken.token,
      refreshToken: refreshToken.token,
    };
  }
}
