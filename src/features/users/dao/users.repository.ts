import { Injectable } from '@nestjs/common';
import { IUsersRepository } from '../types/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './users.schema';
import { IUserModel, UserDocumentType, UserMongoType } from '../types/dao';
import { isValidObjectId } from 'mongoose';
import { DeleteResult, ObjectId } from 'mongodb';
import { UserCreateInputModel } from '../types/dto';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(@InjectModel(User.name) private userModel: IUserModel) {}

  async isUserAuthConfirmed(userId: string): Promise<boolean> {
    const user: UserDocumentType | null = await this.userModel.findById(userId).exec();
    return user !== null && user.isAuthConfirmed();
  }

  async deleteUserById(userId: string): Promise<boolean> {
    const result: DeleteResult = await this.userModel.deleteOne({ _id: new ObjectId(userId) }).exec();
    return result.deletedCount === 1;
  }

  async createUser(model: UserCreateInputModel): Promise<UserMongoType> {
    const user: UserDocumentType = this.userModel.createUser(model);
    await this.saveDoc(user);
    return user;
  }

  async getUserByAuthConfirmationCode(code: string): Promise<UserDocumentType | null> {
    return await this.userModel
      .findOne({
        'authConfirmation.code': code,
      })
      .exec();
  }

  async getUserByPassConfirmationCode(code: string): Promise<UserDocumentType | null> {
    return await this.userModel
      .findOne({
        'passConfirmation.code': code,
      })
      .exec();
  }

  async getUserById(userId: string): Promise<UserDocumentType | null> {
    if (!isValidObjectId(userId)) {
      return null;
    }
    return this.userModel.findById(userId);
  }

  async isUserExist(userId: string): Promise<boolean> {
    const user: UserMongoType | null = await this.userModel.findById(userId).lean();
    return !!user;
  }

  async getUserByLoginOrEmail(login: string, email: string): Promise<UserDocumentType | null> {
    return this.userModel.findOne().or([{ email }, { login }]);
  }

  async getUserByEmail(email: string): Promise<UserDocumentType | null> {
    return await this.userModel.findOne({ email }).exec();
  }

  async saveDoc(doc: UserDocumentType): Promise<void> {
    await doc.save();
  }
  async clear(): Promise<void> {
    await this.userModel.deleteMany({});
  }
}
