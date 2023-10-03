import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AuthSession } from './auth.schema';
import { AuthSessionDocumentType, IAuthSessionModel } from '../types/dao';
import { IAuthSessionRepository } from '../types/common';
import { AuthSessionCreateModel, AuthSessionInfoModel, AuthSessionUpdateModel } from '../types/dto';
import { DeleteResult } from 'mongodb';

@Injectable()
export class AuthSessionRepository implements IAuthSessionRepository {
  constructor(@InjectModel(AuthSession.name) private authSessionModel: IAuthSessionModel) {}

  async createSession(input: AuthSessionCreateModel): Promise<string> {
    const session = this.authSessionModel.createAuthSession(input);
    await this.saveDoc(session);
    return session._id.toString();
  }

  async deleteSession(input: AuthSessionInfoModel): Promise<boolean> {
    const res: DeleteResult = await this.authSessionModel.deleteOne({ userId: input.userId, deviceId: input.deviceId }).exec();
    return res.deletedCount === 1;
  }

  async updateSession(deviceId: string, input: AuthSessionUpdateModel): Promise<boolean> {
    const session: AuthSessionDocumentType | null = await this.authSessionModel.findOne({ deviceId }).exec();

    if (!session) {
      return false;
    }

    session.updateSession(input);

    await this.saveDoc(session);

    return true;
  }

  async deleteAllSessions(model: AuthSessionInfoModel): Promise<boolean> {
    const result: DeleteResult = await this.authSessionModel
      .deleteMany({
        deviceId: { $ne: model.deviceId },
        userId: model.userId,
      })
      .exec();
    return result.deletedCount > 0;
  }

  async saveDoc(doc: AuthSessionDocumentType): Promise<void> {
    await doc.save();
  }

  async clear(): Promise<void> {
    await this.authSessionModel.deleteMany({});
  }
}
