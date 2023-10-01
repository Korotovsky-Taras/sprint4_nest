import { BadRequestException, Body, Controller, Get, HttpCode, Injectable, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UserServiceError, UsersService } from '../../users/domain/users.service';
import { UsersQueryRepository } from '../../users/dao/users.query.repository';
import { IAuthRouterController } from '../types/common';
import { AuthSessionService } from '../domain/auth.service';
import { AuthTokens } from '../utils/tokenCreator.types';
import {
  AuthConfirmationCodeDto,
  AuthLoginInputDto,
  AuthNewPasswordInputDto,
  AuthRegisterInputDto,
  AuthResendingEmailInputDto,
  AuthSessionInfoDto,
} from '../types/dto';
import { Request, Response } from 'express';
import { Status } from '../../../application/utils/types';
import { UsersDataMapper } from '../../users/api/users.dm';
import { UserMeViewDto, UserViewModel } from '../../users/types/dto';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { AuthHelper } from '../../../application/authHelper';
import { AuthSessionGuard } from '../../../application/guards/AuthSessionGuard';
import { GetAuthSessionInfo } from '../../../application/decorators/params/getAuthSessionInfo';
import { AuthTokenGuard } from '../../../application/guards/AuthTokenGuard';
import { GetUserId } from '../../../application/decorators/params/getUserId';

@Injectable()
@Controller('auth')
export class AuthController implements IAuthRouterController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthSessionService,
    private readonly userQueryRepo: UsersQueryRepository,
    private readonly authHelper: AuthHelper,
  ) {}

  @Post('login')
  @HttpCode(Status.OK)
  async login(@Body() input: AuthLoginInputDto, @Req() req: Request, @Res() res: Response) {
    const auth: AuthTokens | null = await this.authService.login({
      loginOrEmail: input.loginOrEmail,
      password: input.password,
      userAgent: this.authHelper.getUserAgent(req),
      ip: this.authHelper.getIp(req),
    });

    if (!auth) {
      throw new UnauthorizedException();
    }

    this.authHelper.applyRefreshToken(res, auth.refreshToken);

    return {
      accessToken: auth.accessToken,
    };
  }

  @Post('logout')
  @UseGuards(AuthSessionGuard)
  @HttpCode(Status.NO_CONTENT)
  async logout(@GetAuthSessionInfo() authSession: AuthSessionInfoDto, @Res() res: Response) {
    const isLogout: boolean = await this.authService.logout(authSession);
    if (isLogout) {
      this.authHelper.clearRefreshToken(res);
      res.sendStatus(Status.NO_CONTENT);
    }
  }

  @Post('refresh-token')
  @UseGuards(AuthSessionGuard)
  @HttpCode(Status.OK)
  async refreshToken(@GetAuthSessionInfo() authSession: AuthSessionInfoDto, @Req() req: Request, @Res() res: Response) {
    const auth: AuthTokens | null = await this.authService.refreshTokens({
      userId: authSession.userId,
      deviceId: authSession.deviceId,
      userAgent: this.authHelper.getUserAgent(req),
      ip: this.authHelper.getIp(req),
    });
    if (!auth) {
      throw new UnauthorizedException();
    }
    this.authHelper.applyRefreshToken(res, auth.refreshToken);

    res.send({
      accessToken: auth.accessToken,
    });
  }

  @Get('me')
  @UseGuards(AuthTokenGuard)
  @HttpCode(Status.OK)
  async me(@GetUserId() userId: string) {
    const user: UserMeViewDto | null = await this.userQueryRepo.getUserById(userId, UsersDataMapper.toMeView);

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  @Post('registration')
  @HttpCode(Status.NO_CONTENT)
  async registration(@Body() input: AuthRegisterInputDto) {
    const result: ServiceResult<UserViewModel> = await this.userService.createUser(input, false);
    if (result.hasErrorCode(UserServiceError.USER_ALREADY_REGISTER)) {
      throw new BadRequestException();
    }
  }

  @Post('registration-confirmation')
  @HttpCode(Status.NO_CONTENT)
  async registrationConfirmation(@Body() input: AuthConfirmationCodeDto) {
    const result: ServiceResult = await this.userService.verifyConfirmationCode(input);
    if (result.hasErrorCode(UserServiceError.AUTH_CONFIRMATION_INVALID)) {
      throw new BadRequestException();
    }
  }

  @Post('registration-email-resending')
  @HttpCode(Status.NO_CONTENT)
  async registrationEmailResending(@Body() input: AuthResendingEmailInputDto) {
    await this.userService.tryResendConfirmationCode(input);
  }

  @Post('password-recovery')
  @HttpCode(Status.NO_CONTENT)
  async passwordRecovery(@Body() input: AuthResendingEmailInputDto) {
    await this.userService.tryResendPasswordRecoverCode(input);
  }

  @Post('new-password')
  @HttpCode(Status.NO_CONTENT)
  async recoverPasswordWithConfirmationCode(@Body() input: AuthNewPasswordInputDto) {
    const result: ServiceResult = await this.userService.recoverPasswordWithConfirmationCode(input);
    if (result.hasErrorCode(UserServiceError.PASS_CONFIRMATION_INVALID)) {
      throw new BadRequestException();
    }
  }
}
