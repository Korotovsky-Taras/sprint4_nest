import { Injectable } from '@nestjs/common';
import { AuthSessionListMapperType, AuthSessionMapperType, IAuthSessionQueryRepository } from '../../types/common';
import { InjectModel } from '@nestjs/mongoose';
import { AuthSession } from './auth.schema';
import { IAuthSession, IAuthSessionModel } from '../../types/dao';
import { WithDbId } from '../../../../application/utils/types';

@Injectable()
export class AuthSessionQueryRepository implements IAuthSessionQueryRepository {
  constructor(@InjectModel(AuthSession.name) private authSessionModel: IAuthSessionModel) {}

  async getAll<T>(userId: string, mapper: AuthSessionListMapperType<T>): Promise<T[]> {
    const sessions: WithDbId<IAuthSession>[] = await this.authSessionModel.find({ userId }).lean();
    return mapper(sessions);
  }

  async getSessionByUserIdDeviceId<T>(userId: string, deviceId: string, mapper: AuthSessionMapperType<T>): Promise<T | null> {
    const query = this.authSessionModel.where({ userId, deviceId });
    const session: WithDbId<IAuthSession> | null = await query.findOne().lean();
    if (session) {
      return mapper(session);
    }
    return null;
  }

  async getSessionByDeviceId<T>(deviceId: string, mapper: AuthSessionMapperType<T>): Promise<T | null> {
    const query = this.authSessionModel.where({ deviceId });
    const session: WithDbId<IAuthSession> | null = await query.findOne().lean();
    if (session) {
      return mapper(session);
    }
    return null;
  }
}
