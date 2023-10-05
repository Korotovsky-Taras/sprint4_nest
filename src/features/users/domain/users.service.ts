import { Injectable } from '@nestjs/common';
import { IUsersService } from '../types/common';
import { UserCreateModel, UserViewModel } from '../types/dto';
import { UsersRepository } from '../dao/users.repository';
import { UsersQueryRepository } from '../dao/users.query.repository';
import { UsersDataMapper } from '../api/users.dm';
import { AbstractUsersService } from './users.auth.service';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../dao/users.schema';
import { IUserModel, UserDocumentType } from '../types/dao';
import { DeleteResult, ObjectId } from 'mongodb';
import { MailSender } from '../../../application/mailSender';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { AuthRegistrationDto } from '../../auth/dto/AuthRegistrationDto';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';
import { AuthConfirmationCodeDto } from '../../auth/dto/AuthConfirmationCodeDto';
import { AuthResendingEmailDto } from '../../auth/dto/AuthResendingEmailDto';
import { AuthPasswordRecoveryDto } from '../../auth/dto/AuthPasswordRecoveryDto';
import { AuthNewPasswordDto } from '../../auth/dto/AuthNewPasswordDto';
import { AuthUserCreateDto } from '../../auth/dto/AuthUserCreateDto';

@Injectable()
export class UsersService extends AbstractUsersService implements IUsersService {
  constructor(
    @InjectModel(User.name) private userModel: IUserModel,
    private readonly usersRepo: UsersRepository,
    private readonly usersQueryRepo: UsersQueryRepository,
    private readonly mailSender: MailSender,
  ) {
    super();
  }

  async deleteUser(userId: string): Promise<boolean> {
    const result: DeleteResult = await this.userModel.deleteOne({ _id: new ObjectId(userId) }).exec();
    return result.deletedCount === 1;
  }

  private async createUser(model: UserCreateModel, isUserConfirmed: boolean): Promise<ServiceResult<UserViewModel>> {
    const result = new ServiceResult<UserViewModel>();
    const isUserRegistered = await this.usersQueryRepo.isUserExistByLoginOrEmail(model.login, model.email);

    if (isUserRegistered) {
      result.addError({
        code: UserServiceError.USER_ALREADY_REGISTER,
      });
      return result;
    }

    const user: UserDocumentType = this.userModel.createUser({
      login: model.login,
      email: model.email,
      password: this._hashPassword(model.password),
      authConfirmation: this._createUserConfirmation(isUserConfirmed),
    });

    if (!isUserConfirmed) {
      this.mailSender.sendRegistrationMail(user.email, user.authConfirmation.code).catch((e) => console.log(e));
    }

    await this.usersRepo.saveDoc(user);

    result.setData(UsersDataMapper.toUserView(user));

    return result;
  }

  async createConfirmedUser(dto: AuthUserCreateDto): Promise<ServiceResult<UserViewModel>> {
    await validateOrRejectDto(dto, AuthUserCreateDto);
    return this.createUser(dto, true);
  }

  async createUserWithConfirmation(dto: AuthRegistrationDto): Promise<ServiceResult<UserViewModel>> {
    await validateOrRejectDto(dto, AuthRegistrationDto);
    return this.createUser(dto, false);
  }

  async verifyConfirmationCode(dto: AuthConfirmationCodeDto): Promise<ServiceResult> {
    await validateOrRejectDto(dto, AuthConfirmationCodeDto);

    const result = new ServiceResult();
    const user: UserDocumentType | null = await this.userModel
      .findOne({
        'authConfirmation.code': dto.code,
      })
      .exec();

    if (user === null || user.isAuthConfirmed() || user.isAuthExpired()) {
      result.addError({
        code: UserServiceError.AUTH_CONFIRMATION_INVALID,
      });
      return result;
    }

    user.setAuthConfirmed(true);
    await this.usersRepo.saveDoc(user);

    return result;
  }

  async tryResendConfirmationCode(dto: AuthResendingEmailDto): Promise<void> {
    await validateOrRejectDto(dto, AuthResendingEmailDto);

    const user: UserDocumentType | null = await this.userModel.findOne({ email: dto.email }).exec();

    if (user && !user.isAuthConfirmed()) {
      user.setAuthConfirmation(this._createUserConfirmation());

      await this.usersRepo.saveDoc(user);

      this.mailSender.sendRegistrationMail(user.email, user.authConfirmation.code).then();
    }
  }

  async tryResendPasswordRecoverCode(dto: AuthPasswordRecoveryDto): Promise<void> {
    await validateOrRejectDto(dto, AuthPasswordRecoveryDto);

    const user: UserDocumentType | null = await this.userModel.findOne({ email: dto.email }).exec();
    if (user) {
      user.setPassConfirmation(this._createUserConfirmation());

      await this.usersRepo.saveDoc(user);

      this.mailSender.sendPasswordRecoveryMail(user.email, user.passConfirmation.code).then();
    }
  }

  async recoverPasswordWithConfirmationCode(dto: AuthNewPasswordDto): Promise<ServiceResult> {
    await validateOrRejectDto(dto, AuthNewPasswordDto);

    const result = new ServiceResult();
    const user: UserDocumentType | null = await this.userModel
      .findOne({
        'passConfirmation.code': dto.recoveryCode,
      })
      .exec();

    if (user === null || user.isPassExpired() || user.isPassConfirmed()) {
      result.addError({
        code: UserServiceError.PASS_CONFIRMATION_INVALID,
      });
    } else {
      user.password = this._hashPassword(dto.newPassword);
      user.setPassConfirmed(true);
      await this.usersRepo.saveDoc(user);
    }
    return result;
  }
}

export enum UserServiceError {
  AUTH_CONFIRMATION_INVALID = 1,
  PASS_CONFIRMATION_INVALID = 2,
  USER_ALREADY_REGISTER = 3,
}
