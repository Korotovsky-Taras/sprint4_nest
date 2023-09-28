import { BadRequestException, Body, Controller, Get, HttpCode, Injectable, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { UserServiceError, UsersService } from '../../users/domain/users.service';
import { UsersQueryRepository } from '../../users/dao/users.query.repository';
import { IAuthRouterController } from '../types/common';
import { AuthSessionService } from '../domain/auth.service';
import { AuthTokens } from '../utils/tokenCreator.types';
import { AuthConfirmationCodeDto, AuthLoginInputDto, AuthNewPasswordInputDto, AuthRegisterInputDto, AuthResendingEmailInputDto } from '../types/dto';
import { Request, Response } from 'express';
import { Status } from '../../../application/utils/types';
import { UsersDataMapper } from '../../users/api/users.dm';
import { UserMeViewDto, UserViewDto } from '../../users/types/dto';
import { ServiceResult } from '../../../application/errors/ServiceResult';
import { ServiceEmptyResult } from '../../../application/errors/ServiceEmptyResult';

@Injectable()
@Controller('auth')
export class AuthController implements IAuthRouterController {
  constructor(
    private readonly userService: UsersService,
    private readonly authService: AuthSessionService,
    private readonly userQueryRepo: UsersQueryRepository,
  ) {}

  @Post('login')
  @HttpCode(Status.OK)
  async login(@Body() input: AuthLoginInputDto, @Req() req: Request, @Res() res: Response) {
    const auth: AuthTokens | null = await this.authService.login({
      loginOrEmail: input.loginOrEmail,
      password: input.password,
      userAgent: req.header('user-agent') || 'unknown',
      ip: req.ip,
    });

    if (!auth) {
      throw new UnauthorizedException();
    }

    res.cookie('refreshToken', auth.refreshToken, { httpOnly: true, secure: true });
    return {
      accessToken: auth.accessToken,
    };
  }

  @Post('logout')
  @HttpCode(Status.NO_CONTENT)
  async logout(@Req() req: Request, @Res() res: Response) {
    if (!req.userId || !req.deviceId) {
      throw new UnauthorizedException();
    }
    const isLogout: boolean = await this.authService.logout({
      userId: req.userId,
      deviceId: req.deviceId,
    });
    if (isLogout) {
      res.clearCookie('refreshToken');
    }
  }

  @Post('refresh-token')
  @HttpCode(Status.OK)
  async refreshToken(@Req() req: Request, @Res() res: Response) {
    if (!req.userId || !req.deviceId) {
      throw new UnauthorizedException();
    }
    const auth: AuthTokens | null = await this.authService.refreshTokens({
      userId: req.userId,
      deviceId: req.deviceId,
      userAgent: req.header('user-agent') || 'unknown',
      ip: req.ip,
    });
    if (!auth) {
      throw new UnauthorizedException();
    }
    res.cookie('refreshToken', auth.refreshToken, { httpOnly: true, secure: true });
    return {
      accessToken: auth.accessToken,
    };
  }

  @Get('me')
  @HttpCode(Status.OK)
  async me(@Req() req: Request) {
    if (!req.userId) {
      throw new UnauthorizedException();
    }
    const user: UserMeViewDto | null = await this.userQueryRepo.getUserById(req.userId, UsersDataMapper.toMeView);

    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }

  @Post('registration')
  @HttpCode(Status.NO_CONTENT)
  async registration(@Body() input: AuthRegisterInputDto) {
    const result: ServiceResult<UserViewDto> = await this.userService.createUser(input, false);
    if (result.hasErrorCode(UserServiceError.USER_ALREADY_REGISTER)) {
      throw new BadRequestException();
    }
  }

  @Post('registration-confirmation')
  @HttpCode(Status.NO_CONTENT)
  async registrationConfirmation(@Body() input: AuthConfirmationCodeDto) {
    const result: ServiceEmptyResult = await this.userService.verifyConfirmationCode(input);
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
    const result: ServiceEmptyResult = await this.userService.recoverPasswordWithConfirmationCode(input);
    if (result.hasErrorCode(UserServiceError.PASS_CONFIRMATION_INVALID)) {
      throw new BadRequestException();
    }
  }
}
