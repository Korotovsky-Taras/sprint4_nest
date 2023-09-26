import { Injectable } from '@nestjs/common';
import { IUsersRepository } from '../types/common';
import { InjectModel } from '@nestjs/mongoose';
import { User } from './users.schema';
import { IUserModel, UserDocumentType } from '../types/dao';

@Injectable()
export class UsersRepository implements IUsersRepository {
  constructor(@InjectModel(User.name) private userModel: IUserModel) {}
  async saveDoc(doc: UserDocumentType): Promise<void> {
    await doc.save();
  }
  async clear(): Promise<void> {
    await this.userModel.deleteMany({});
  }
}
