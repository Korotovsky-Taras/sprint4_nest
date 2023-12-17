import { Controller, Delete, ForbiddenException, Get, HttpCode, Inject, Injectable, NotFoundException, Param, UseGuards } from '@nestjs/common';
import { Status } from '../../../application/utils/types';
import { GetUserId } from '../../../application/decorators/params/getUserId';
import { AuthSessionGuard } from '../../../application/guards/AuthSessionGuard';
import { AuthSessionInfoModel } from '../types/dto';
import { GetAuthSessionInfo } from '../../../application/decorators/params/getAuthSessionInfo';
import { AuthRepoKey, AuthRepoQueryKey, IAuthSessionQueryRepository, IAuthSessionRepository } from '../types/common';

@Injectable()
@Controller('security/devices')
export class AuthSecurityController {
  constructor(
    @Inject(AuthRepoKey) private readonly authRepo: IAuthSessionRepository<any>,
    @Inject(AuthRepoQueryKey) private readonly authQueryRepo: IAuthSessionQueryRepository,
  ) {}

  @Get()
  @UseGuards(AuthSessionGuard)
  @HttpCode(Status.OK)
  async getAll(@GetUserId() userId: string) {
    return await this.authQueryRepo.getAll(userId);
  }

  @Delete()
  @UseGuards(AuthSessionGuard)
  @HttpCode(Status.NO_CONTENT)
  async deleteAll(@GetAuthSessionInfo() sessionInfo: AuthSessionInfoModel) {
    const isDeleted: boolean = await this.authRepo.deleteAllSessions({
      userId: sessionInfo.userId,
      deviceId: sessionInfo.deviceId,
    });

    if (!isDeleted) {
      //TODO что делать в таком случаи?) надо ли его обрабатывать
      throw new NotFoundException();
    }
  }

  @Delete('/:id')
  @UseGuards(AuthSessionGuard)
  @HttpCode(Status.NO_CONTENT)
  async deleteDevice(@GetAuthSessionInfo() sessionInfo: AuthSessionInfoModel, @Param('id') sessionId: string) {
    const session = await this.authQueryRepo.getSessionByDeviceId(sessionId);

    if (session === null) {
      throw new NotFoundException();
    }
    if (String(session.userId) !== String(sessionInfo.userId)) {
      throw new ForbiddenException();
    }

    const isDeleted: boolean = await this.authRepo.deleteSession({
      userId: session.userId,
      deviceId: session.deviceId,
    });

    if (!isDeleted) {
      //TODO что делать в таком случаи?) надо ли его обрабатывать
      throw new NotFoundException();
    }
  }
}
