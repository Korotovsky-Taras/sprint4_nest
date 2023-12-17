import { Injectable } from '@nestjs/common';
import { IAuthSessionQueryRepository } from '../../types/common';
import { InjectModel } from '@nestjs/mongoose';
import { AuthSession } from './auth.schema';
import { IAuthSession, IAuthSessionModel } from '../../types/dao';
import { WithDbId } from '../../../../application/utils/types';
import { AuthSessionByDeviceViewModel, AuthSessionUuidViewModel, AuthSessionViewModel } from '../../types/dto';
import { AuthMongoDataMapper } from './auth.mongo.dm';

@Injectable()
export class AuthMongoQueryRepository implements IAuthSessionQueryRepository {
  constructor(@InjectModel(AuthSession.name) private authSessionModel: IAuthSessionModel) {}

  async getAll(userId: string): Promise<AuthSessionViewModel[]> {
    const sessions: WithDbId<IAuthSession>[] = await this.authSessionModel.find({ userId }).lean();
    return AuthMongoDataMapper.toSessionsView(sessions);
  }

  async getSessionByUserIdDeviceId(userId: string, deviceId: string): Promise<AuthSessionViewModel | null> {
    const query = this.authSessionModel.where({ userId, deviceId });
    const session: WithDbId<IAuthSession> | null = await query.findOne().lean();
    if (session) {
      return AuthMongoDataMapper.toSessionView(session);
    }
    return null;
  }

  async getSessionUuidByUserIdDeviceId(userId: string, deviceId: string): Promise<AuthSessionUuidViewModel | null> {
    const query = this.authSessionModel.where({ userId, deviceId });
    const session: WithDbId<IAuthSession> | null = await query.findOne().lean();
    if (session) {
      return AuthMongoDataMapper.toSessionUuid(session);
    }
    return null;
  }

  async getSessionByDeviceId(deviceId: string): Promise<AuthSessionByDeviceViewModel | null> {
    const query = this.authSessionModel.where({ deviceId });
    const session: WithDbId<IAuthSession> | null = await query.findOne().lean();
    if (session) {
      return AuthMongoDataMapper.toUserSessionByDevice(session);
    }
    return null;
  }
}
