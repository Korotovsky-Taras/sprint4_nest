import { Injectable } from '@nestjs/common';
import { AuthSessionListMapperType, AuthSessionMapperType, IAuthSessionQueryRepository } from '../types/common';
import { InjectModel } from '@nestjs/mongoose';
import { AuthSession } from './auth.schema';
import { AuthSessionMongoType, IAuthSessionModel } from '../types/dao';

@Injectable()
export class AuthSessionQueryRepository implements IAuthSessionQueryRepository {
  constructor(@InjectModel(AuthSession.name) private authSessionModel: IAuthSessionModel) {}

  async getAll<T>(userId: string, dto: AuthSessionListMapperType<T>): Promise<T[]> {
    const sessions: AuthSessionMongoType[] = await this.authSessionModel.find({ userId }).lean();
    return dto(sessions);
  }
  async getSessionByUserIdDeviceId<T>(userId: string, deviceId: string, dto: AuthSessionMapperType<T>): Promise<T | null> {
    const query = this.authSessionModel.where({ userId, deviceId });
    const session: AuthSessionMongoType | null = await query.findOne().lean();
    if (session) {
      return dto(session);
    }
    return null;
  }
  async isSessionByDeviceIdExist(deviceId: string): Promise<boolean> {
    const query = this.authSessionModel.where({ deviceId });
    const session: AuthSessionMongoType | null = await query.findOne().lean();
    return session !== null;
  }
  async getSessionByDeviceId<T>(deviceId: string, dto: AuthSessionMapperType<T>): Promise<T | null> {
    const query = this.authSessionModel.where({ deviceId });
    const session: AuthSessionMongoType | null = await query.findOne().lean();
    if (session) {
      return dto(session);
    }
    return null;
  }
}
