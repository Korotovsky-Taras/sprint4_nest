import { Injectable } from '@nestjs/common';
import { IAuthSessionQueryRepository } from '../../types/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { AuthEntity } from './auth.entity';
import { AuthSessionByDeviceViewModel, AuthSessionUuidViewModel, AuthSessionViewModel } from '../../types/dto';
import { AuthSqlOrmDataMapper } from './auth.sql-orm.dm';

@Injectable()
export class AuthSqlOrmQueryRepository implements IAuthSessionQueryRepository {
  constructor(@InjectRepository(AuthEntity) private authRepo: Repository<AuthEntity>) {}

  async getAll(userId: string): Promise<AuthSessionViewModel[]> {
    const sessions: AuthEntity[] = await this.authRepo.find({ where: { userId: Number(userId) } });
    return AuthSqlOrmDataMapper.toSessionsView(sessions);
  }

  async getSessionByUserIdDeviceId(userId: string, deviceId: string): Promise<AuthSessionViewModel | null> {
    const session = await this.authRepo.findOne({ where: { userId: Number(userId), deviceId } });
    if (session) {
      return AuthSqlOrmDataMapper.toSessionView(session);
    }
    return null;
  }

  async getSessionUuidByUserIdDeviceId(userId: string, deviceId: string): Promise<AuthSessionUuidViewModel | null> {
    const session = await this.authRepo.findOne({ where: { userId: Number(userId), deviceId } });
    if (session) {
      return AuthSqlOrmDataMapper.toSessionUuid(session);
    }
    return null;
  }

  async getSessionByDeviceId(deviceId: string): Promise<AuthSessionByDeviceViewModel | null> {
    const session = await this.authRepo.findOne({ where: { deviceId } });
    if (session) {
      return AuthSqlOrmDataMapper.toUserSessionByDevice(session);
    }
    return null;
  }
}
