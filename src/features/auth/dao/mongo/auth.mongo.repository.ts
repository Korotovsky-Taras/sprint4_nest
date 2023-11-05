import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { AuthSession } from './auth.schema';
import { AuthSessionDocumentType, AuthSessionMongoType, IAuthSessionModel } from '../../types/dao';
import { IAuthSessionRepository } from '../../types/common';
import { AuthSessionCreateModel, AuthSessionInfoModel } from '../../types/dto';
import { DeleteResult } from 'mongodb';
import { AuthEntityRepo } from '../auth-entity.repo';
import { AuthEntityFactory } from '../auth-entity.factory';

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

  async getSessionByDeviceId(deviceId: string): Promise<AuthEntityRepo | null> {
    const session: AuthSessionDocumentType | null = await this.authSessionModel.findOne({ deviceId }).exec();
    if (session) {
      return AuthEntityFactory.createMongoEntity(session, () => this.saveDoc(session));
    }
    return null;
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

  async isSessionByDeviceIdExist(deviceId: string): Promise<boolean> {
    const query = this.authSessionModel.where({ deviceId });
    const session: AuthSessionMongoType | null = await query.findOne().lean();
    return session !== null;
  }

  async saveDoc(doc: AuthSessionDocumentType): Promise<void> {
    await doc.save();
  }

  async clear(): Promise<void> {
    await this.authSessionModel.deleteMany({});
  }
}
