import { Injectable } from '@nestjs/common';
import { IUsersRepository } from '../../types/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './users.schema';
import { IUserModel, UserDocumentType, UserMongoType } from '../../types/dao';
import { isValidObjectId } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';
import { UserCreateInputModel } from '../../types/dto';
import { UserEntityFactory } from '../user-entity.factory';
import { UserEntityRepo } from '../user-entity.repo';

@Injectable()
export class UsersMongoRepository implements IUsersRepository {
  constructor(@InjectModel(User.name) private userModel: IUserModel) {}

  async isUserAuthConfirmed(userId: string): Promise<boolean> {
    const user: UserDocumentType | null = await this.userModel.findById(userId).exec();
    return user !== null && user.isAuthConfirmed();
  }

  async deleteUserById(userId: string): Promise<boolean> {
    const result: DeleteResult = await this.userModel.deleteOne({ _id: new ObjectId(userId) }).exec();
    return result.deletedCount === 1;
  }

  async createUser(model: UserCreateInputModel): Promise<UserEntityRepo> {
    const user: UserDocumentType = this.userModel.createUser(model);
    await this.saveDoc(user);
    return UserEntityFactory.createMongoEntity(user, () => this.saveDoc(user));
  }

  async getUserByAuthConfirmationCode(code: string): Promise<UserEntityRepo | null> {
    const user: UserDocumentType | null = await this.userModel.findOne({
      'authConfirmation.code': code,
    });
    if (user) {
      return UserEntityFactory.createMongoEntity(user, () => this.saveDoc(user));
    }
    return null;
  }

  async getUserByPassConfirmationCode(code: string): Promise<UserEntityRepo | null> {
    const user: UserDocumentType | null = await this.userModel.findOne({
      'passConfirmation.code': code,
    });
    if (user) {
      return UserEntityFactory.createMongoEntity(user, () => this.saveDoc(user));
    }
    return null;
  }

  async getUserById(userId: string): Promise<UserEntityRepo | null> {
    if (!isValidObjectId(userId)) {
      return null;
    }
    const user: UserDocumentType | null = await this.userModel.findById(userId);
    if (user) {
      return UserEntityFactory.createMongoEntity(user, () => this.saveDoc(user));
    }
    return null;
  }

  async isUserExist(userId: string): Promise<boolean> {
    const user: UserMongoType | null = await this.userModel.findById(userId).lean();
    return !!user;
  }

  async getUserByLoginOrEmail(login: string, email: string): Promise<UserEntityRepo | null> {
    const user: UserDocumentType | null = await this.userModel.findOne().or([{ email }, { login }]);
    if (user) {
      return UserEntityFactory.createMongoEntity(user, () => this.saveDoc(user));
    }
    return null;
  }

  async getUserByEmail(email: string): Promise<UserEntityRepo | null> {
    const user: UserDocumentType | null = await this.userModel.findOne({ email });
    if (user) {
      return UserEntityFactory.createMongoEntity(user, () => this.saveDoc(user));
    }
    return null;
  }

  async saveDoc(doc: UserDocumentType): Promise<void> {
    await doc.save();
  }

  async clear(): Promise<void> {
    await this.userModel.deleteMany({});
  }
}
