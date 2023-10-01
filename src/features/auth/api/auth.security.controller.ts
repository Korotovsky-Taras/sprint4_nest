import { Controller, Delete, ForbiddenException, Get, HttpCode, Injectable, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { UsersQueryRepository } from '../../users/dao/users.query.repository';
import { AuthDataMapper } from './auth.dm';
import { Status } from '../../../application/utils/types';
import { AuthSessionRepository } from '../dao/auth.repository';
import { AuthSessionQueryRepository } from '../dao/auth.query.repository';
import { AuthTokenGuard } from '../../../application/guards/AuthTokenGuard';
import { GetUserId } from '../../../application/decorators/params/getUserId';
import { AuthSessionGuard } from '../../../application/guards/AuthSessionGuard';
import { AuthSessionInfoDto } from '../types/dto';
import { GetAuthSessionInfo } from '../../../application/decorators/params/getAuthSessionInfo';
import { SetTokenGuardParams } from '../../../application/decorators/skipTokenError';

@Injectable()
@Controller('security/devices')
export class AuthSecurityController {
  constructor(
    private usersQueryRepo: UsersQueryRepository,
    private authSessionRepo: AuthSessionRepository,
    private authSessionQueryRepo: AuthSessionQueryRepository,
  ) {}

  @Get()
  @SetTokenGuardParams({ throwError: false })
  @UseGuards(AuthTokenGuard)
  @HttpCode(Status.OK)
  async getAll(@GetUserId() userId: string) {
    return await this.authSessionQueryRepo.getAll(userId, AuthDataMapper.toSessionsView);
  }

  @Delete()
  @UseGuards(AuthSessionGuard)
  @HttpCode(Status.NO_CONTENT)
  async deleteAll(@GetAuthSessionInfo() sessionInfo: AuthSessionInfoDto) {
    const isDeleted: boolean = await this.authSessionRepo.deleteAllSessions({
      userId: sessionInfo.userId,
      deviceId: sessionInfo.deviceId,
    });

    if (!isDeleted) {
      //TODO что делать в таком случаи?) надо ли его обрабатывать
      throw new NotFoundException();
    }
  }

  @Delete(':id')
  @UseGuards(AuthSessionGuard)
  @HttpCode(Status.NO_CONTENT)
  async deleteDevice(@GetAuthSessionInfo() sessionInfo: AuthSessionInfoDto, @Param('id') sessionId: string) {
    const session = await this.authSessionQueryRepo.getSessionByDeviceId(sessionId, AuthDataMapper.toUserSessionValidate);

    if (session === null) {
      throw new NotFoundException();
    }
    if (session.userId !== sessionInfo.userId) {
      throw new ForbiddenException();
    }

    const isDeleted: boolean = await this.authSessionRepo.deleteSession(sessionInfo);

    if (!isDeleted) {
      //TODO что делать в таком случаи?) надо ли его обрабатывать
      throw new NotFoundException();
    }
  }
}
