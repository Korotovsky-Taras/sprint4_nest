import { Injectable } from '@nestjs/common';
import { IUsersService } from '../types/common';
import { UserCreateRequestDto, UserViewModel } from '../types/dto';
import { UsersRepository } from '../dao/users.repository';
import { UsersQueryRepository } from '../dao/users.query.repository';
import { UsersDataMapper } from '../api/users.dm';
import { AbstractUsersService } from './users.auth.service';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../dao/users.schema';
import { IUserModel, UserDocumentType } from '../types/dao';
import { DeleteResult, ObjectId } from 'mongodb';
import { MailSender } from '../../../application/mailSender';
import { AuthConfirmationCodeDto, AuthNewPasswordInputDto, AuthResendingEmailInputDto } from '../../auth/types/dto';
import { ServiceResult } from '../../../application/core/ServiceResult';

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

  async createUser(model: UserCreateRequestDto, isUserConfirmed: boolean): Promise<ServiceResult<UserViewModel>> {
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
      this.mailSender.sendRegistrationMail(user.email, user.authConfirmation.code).then();
    }

    await this.usersRepo.saveDoc(user);

    result.setData(UsersDataMapper.toUserView(user));

    return result;
  }

  async verifyConfirmationCode(model: AuthConfirmationCodeDto): Promise<ServiceResult> {
    const result = new ServiceResult();
    const user: UserDocumentType | null = await this.userModel
      .findOne({
        'authConfirmation.code': model.code,
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

  async tryResendConfirmationCode(input: AuthResendingEmailInputDto): Promise<void> {
    const user: UserDocumentType | null = await this.userModel.findOne({ email: input.email }).exec();

    if (user && !user.isAuthConfirmed()) {
      user.setAuthConfirmation(this._createUserConfirmation());

      await this.usersRepo.saveDoc(user);

      this.mailSender.sendRegistrationMail(user.email, user.authConfirmation.code).then();
    }
  }

  async tryResendPasswordRecoverCode(input: AuthResendingEmailInputDto): Promise<void> {
    const user: UserDocumentType | null = await this.userModel.findOne({ email: input.email }).exec();
    if (user) {
      user.setPassConfirmation(this._createUserConfirmation());

      await this.usersRepo.saveDoc(user);

      this.mailSender.sendPasswordRecoveryMail(user.email, user.passConfirmation.code).then();
    }
  }

  async recoverPasswordWithConfirmationCode(model: AuthNewPasswordInputDto): Promise<ServiceResult> {
    const result = new ServiceResult();
    const user: UserDocumentType | null = await this.userModel
      .findOne({
        'passConfirmation.code': model.recoveryCode,
      })
      .exec();

    if (user === null || user.isPassExpired() || user.isPassConfirmed()) {
      result.addError({
        code: UserServiceError.PASS_CONFIRMATION_INVALID,
      });
    } else {
      user.password = this._hashPassword(model.newPassword);
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
