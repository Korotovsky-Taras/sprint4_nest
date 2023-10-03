import { BadRequestException, Body, Controller, Get, HttpCode, Injectable, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UserServiceError, UsersService } from '../../users/domain/users.service';
import { UsersQueryRepository } from '../../users/dao/users.query.repository';
import { IAuthRouterController } from '../types/common';
import { AuthSessionService } from '../domain/auth.service';
import { AuthTokens } from '../utils/tokenCreator.types';
import { AuthSessionInfoModel } from '../types/dto';
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
import { RateLimiterGuard } from '../../../application/guards/RateLimiterGuard';
import { AuthLoginInputDto } from '../dto/AuthLoginInputDto';
import { AuthRegistrationDto } from '../dto/AuthRegistrationDto';
import { AuthConfirmationCodeDto } from '../dto/AuthConfirmationCodeDto';
import { AuthResendingEmailDto } from '../dto/AuthResendingEmailDto';
import { AuthPasswordRecoveryDto } from '../dto/AuthPasswordRecoveryDto';
import { AuthNewPasswordDto } from '../dto/AuthNewPasswordDto';

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
  @UseGuards(RateLimiterGuard)
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

    res.status(Status.OK).send({
      accessToken: auth.accessToken,
    });
  }

  @Post('logout')
  @UseGuards(AuthSessionGuard)
  @HttpCode(Status.NO_CONTENT)
  async logout(@GetAuthSessionInfo() authSession: AuthSessionInfoModel, @Res() res: Response) {
    const isLogout: boolean = await this.authService.logout(authSession);
    if (isLogout) {
      this.authHelper.clearRefreshToken(res);
    }
    res.sendStatus(Status.NO_CONTENT);
  }

  @Post('refresh-token')
  @UseGuards(AuthSessionGuard)
  @HttpCode(Status.OK)
  async refreshToken(@GetAuthSessionInfo() authSession: AuthSessionInfoModel, @Req() req: Request, @Res() res: Response) {
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

    res.status(Status.OK).send({
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
  @UseGuards(RateLimiterGuard)
  @HttpCode(Status.NO_CONTENT)
  async registration(@Body() input: AuthRegistrationDto) {
    const result: ServiceResult<UserViewModel> = await this.userService.createUserWithConfirmation(input);
    if (result.hasErrorCode(UserServiceError.USER_ALREADY_REGISTER)) {
      throw new BadRequestException();
    }
  }

  @Post('registration-confirmation')
  @UseGuards(RateLimiterGuard)
  @HttpCode(Status.NO_CONTENT)
  async registrationConfirmation(@Body() input: AuthConfirmationCodeDto) {
    const result: ServiceResult = await this.userService.verifyConfirmationCode(input);
    if (result.hasErrorCode(UserServiceError.AUTH_CONFIRMATION_INVALID)) {
      throw new BadRequestException();
    }
  }

  @Post('registration-email-resending')
  @UseGuards(RateLimiterGuard)
  @HttpCode(Status.NO_CONTENT)
  async registrationEmailResending(@Body() input: AuthResendingEmailDto) {
    await this.userService.tryResendConfirmationCode(input);
  }

  @Post('password-recovery')
  @UseGuards(RateLimiterGuard)
  @HttpCode(Status.NO_CONTENT)
  async passwordRecovery(@Body() input: AuthPasswordRecoveryDto) {
    await this.userService.tryResendPasswordRecoverCode(input);
  }

  @Post('new-password')
  @UseGuards(RateLimiterGuard)
  @HttpCode(Status.NO_CONTENT)
  async recoverPasswordWithConfirmationCode(@Body() input: AuthNewPasswordDto) {
    const result: ServiceResult = await this.userService.recoverPasswordWithConfirmationCode(input);
    if (result.hasErrorCode(UserServiceError.PASS_CONFIRMATION_INVALID)) {
      throw new BadRequestException();
    }
  }
}
