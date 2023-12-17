import { BadRequestException, Body, Controller, Get, HttpCode, Inject, Injectable, Post, Req, Res, UnauthorizedException, UseGuards } from '@nestjs/common';
import { UsersService } from '../../users/domain/users.service';
import { IAuthRouterController } from '../types/common';
import { AuthSessionService } from '../domain/auth.service';
import { AuthTokens } from '../utils/tokenCreator.types';
import { AuthSessionInfoModel } from '../types/dto';
import { Request, Response } from 'express';
import { Status } from '../../../application/utils/types';
import { UserMeViewModel, UserViewModel } from '../../users/types/dto';
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
import { CommandBus } from '@nestjs/cqrs';
import { AuthLoginCommand } from '../use-cases/auth-login.case';
import { AuthLogoutCommand } from '../use-cases/auth-logout.case';
import { AuthRefreshTokensCommand } from '../use-cases/auth-refresh-tokens.case';
import { AuthCreateUserWithConfirmationCommand } from '../use-cases/auth-create-user-with-code.case';
import { AuthVerifyRegistrationCodeCommand } from '../use-cases/auth-verify-registration-code.case';
import { AuthServiceError } from '../types/errors';
import { AuthRecoverPasswordWithCodeCommand } from '../use-cases/auth-recover-password-with-code.case';
import { UserServiceError } from '../../users/types/errors';
import { AuthResendConfirmationCodeCommand } from '../use-cases/auth-resend-cofirmation-code';
import { AuthResendPassConfirmationCodeCommand } from '../use-cases/auth-resend-pass-cofirmation-code';
import { IUsersQueryRepository, UserQueryRepoKey } from '../../users/types/common';

@Injectable()
@Controller('auth')
export class AuthController implements IAuthRouterController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthSessionService,
    @Inject(UserQueryRepoKey) private usersQueryRepo: IUsersQueryRepository,
    private readonly authHelper: AuthHelper,
    private readonly commandBus: CommandBus,
  ) {}

  @Post('login')
  @UseGuards(RateLimiterGuard)
  @HttpCode(Status.OK)
  async login(@Body() input: AuthLoginInputDto, @Req() req: Request, @Res() res: Response) {
    const result: ServiceResult<AuthTokens> = await this.commandBus.execute<AuthLoginCommand, ServiceResult<AuthTokens>>(
      new AuthLoginCommand({
        loginOrEmail: input.loginOrEmail,
        password: input.password,
        userAgent: this.authHelper.getUserAgent(req),
        ip: this.authHelper.getIp(req),
      }),
    );

    if (result.hasErrors()) {
      throw new UnauthorizedException();
    }

    const { refreshToken, accessToken } = result.getData();

    this.authHelper.applyRefreshToken(res, refreshToken);

    res.status(Status.OK).send({
      accessToken,
    });
  }

  @Post('logout')
  @UseGuards(AuthSessionGuard)
  @HttpCode(Status.NO_CONTENT)
  async logout(@GetAuthSessionInfo() authSession: AuthSessionInfoModel, @Res() res: Response) {
    const result: ServiceResult = await this.commandBus.execute<AuthLogoutCommand, ServiceResult>(new AuthLogoutCommand(authSession));

    if (result.hasErrors()) {
      throw new UnauthorizedException();
    }

    this.authHelper.clearRefreshToken(res);

    res.sendStatus(Status.NO_CONTENT);
  }

  @Post('refresh-token')
  @UseGuards(AuthSessionGuard)
  @HttpCode(Status.OK)
  async refreshToken(@GetAuthSessionInfo() authSession: AuthSessionInfoModel, @Req() req: Request, @Res() res: Response) {
    const result = await this.commandBus.execute<AuthRefreshTokensCommand, ServiceResult<AuthTokens>>(
      new AuthRefreshTokensCommand({
        userId: authSession.userId,
        deviceId: authSession.deviceId,
        userAgent: this.authHelper.getUserAgent(req),
        ip: this.authHelper.getIp(req),
      }),
    );

    if (result.hasErrors()) {
      throw new UnauthorizedException();
    }

    const { refreshToken, accessToken } = result.getData();

    this.authHelper.applyRefreshToken(res, refreshToken);

    res.status(Status.OK).send({
      accessToken,
    });
  }

  @Get('me')
  @UseGuards(AuthTokenGuard)
  @HttpCode(Status.OK)
  async me(@GetUserId() userId: string) {
    const user: UserMeViewModel | null = await this.usersQueryRepo.getUserById(userId);

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  @Post('registration')
  @UseGuards(RateLimiterGuard)
  @HttpCode(Status.NO_CONTENT)
  async registration(@Body() dto: AuthRegistrationDto) {
    const result: ServiceResult<UserViewModel> = await this.commandBus.execute<AuthCreateUserWithConfirmationCommand, ServiceResult<UserViewModel>>(
      new AuthCreateUserWithConfirmationCommand(dto),
    );
    if (result.hasErrorCode(UserServiceError.USER_ALREADY_REGISTER)) {
      throw new BadRequestException();
    }
  }

  @Post('registration-confirmation')
  @UseGuards(RateLimiterGuard)
  @HttpCode(Status.NO_CONTENT)
  async registrationConfirmation(@Body() dto: AuthConfirmationCodeDto) {
    const result: ServiceResult = await this.commandBus.execute<AuthVerifyRegistrationCodeCommand, ServiceResult>(new AuthVerifyRegistrationCodeCommand(dto));
    if (result.hasErrorCode(AuthServiceError.AUTH_REG_CONFIRMATION_INVALID)) {
      throw new BadRequestException();
    }
  }

  @Post('registration-email-resending')
  @UseGuards(RateLimiterGuard)
  @HttpCode(Status.NO_CONTENT)
  async registrationEmailResending(@Body() dto: AuthResendingEmailDto) {
    await this.commandBus.execute<AuthResendConfirmationCodeCommand, ServiceResult>(new AuthResendConfirmationCodeCommand(dto));
  }

  @Post('password-recovery')
  @UseGuards(RateLimiterGuard)
  @HttpCode(Status.NO_CONTENT)
  async passwordRecovery(@Body() dto: AuthPasswordRecoveryDto) {
    await this.commandBus.execute<AuthResendPassConfirmationCodeCommand, ServiceResult>(new AuthResendPassConfirmationCodeCommand(dto));
  }

  @Post('new-password')
  @UseGuards(RateLimiterGuard)
  @HttpCode(Status.NO_CONTENT)
  async recoverPasswordWithConfirmationCode(@Body() dto: AuthNewPasswordDto) {
    const result: ServiceResult = await this.commandBus.execute<AuthRecoverPasswordWithCodeCommand, ServiceResult>(new AuthRecoverPasswordWithCodeCommand(dto));
    if (result.hasErrorCode(AuthServiceError.AUTH_PASS_CONFIRMATION_INVALID)) {
      throw new BadRequestException();
    }
  }
}
