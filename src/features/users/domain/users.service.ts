import { Injectable } from '@nestjs/common';
import { IUsersService } from '../types/common';
import { UserCreateRequestDto, UserViewDto } from '../types/dto';
import { UsersRepository } from '../dao/users.repository';
import { UsersQueryRepository } from '../dao/users.query.repository';
import { UsersDataMapper } from '../api/users.dm';
import { AbstractUsersService } from './users.auth.service';
import { InjectModel } from '@nestjs/mongoose';
import { User } from '../dao/users.schema';
import { IUserModel, UserDocumentType } from '../types/dao';
import { DeleteResult, ObjectId } from 'mongodb';

@Injectable()
export class UsersService extends AbstractUsersService implements IUsersService {
  constructor(
    @InjectModel(User.name) private userModel: IUserModel,
    private readonly usersRepo: UsersRepository,
    private readonly usersQueryRepo: UsersQueryRepository,
  ) {
    super();
  }

  async deleteUser(userId: string): Promise<boolean> {
    const result: DeleteResult = await this.userModel.deleteOne({ _id: new ObjectId(userId) }).exec();
    return result.deletedCount === 1;
  }

  /**
   * Создаст пользователя без подтверждения авторизации
   */
  async createUser(model: UserCreateRequestDto): Promise<UserViewDto | null> {
    const isUserRegistered = await this.usersQueryRepo.isUserExistByLoginOrEmail(model.login, model.email);

    if (isUserRegistered) {
      return null;
    }

    const user: UserDocumentType = this.userModel.createUser({
      login: model.login,
      email: model.email,
      password: this._hashPassword(model.password),
      authConfirmation: this._createUserConfirmation(true),
    });

    await this.usersRepo.saveDoc(user);

    return UsersDataMapper.toUserView(user);
  }
}
