import { Injectable } from '@nestjs/common';
import { IAuthSessionQueryRepository } from '../../types/common';
import { IAuthSession } from '../../types/dao';
import { DataSource } from 'typeorm';
import { WithDbId } from '../../../../application/utils/types';
import { InjectDataSource } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';
import { AuthSessionByDeviceViewModel, AuthSessionUuidViewModel, AuthSessionViewModel } from '../../types/dto';
import { AuthSqlRawDataMapper } from './auth.sql-raw.dm';
import { AuthMongoDataMapper } from '../mongo/auth.mongo.dm';

@Injectable()
export class AuthSqlRawQueryRepository implements IAuthSessionQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getAll(userId: string): Promise<AuthSessionViewModel[]> {
    const res = await this.dataSource.query<WithDbId<IAuthSession>[]>(`SELECT * FROM public."AuthSession" as a WHERE a."userId" = $1`, [userId]);
    return AuthSqlRawDataMapper.toSessionsView(res);
  }

  async getSessionByUserIdDeviceId(userId: string, deviceId: string): Promise<AuthSessionViewModel | null> {
    if (!isUUID(deviceId)) {
      return null;
    }
    const res = await this.dataSource.query<WithDbId<IAuthSession>[]>(
      `SELECT * FROM 
             public."AuthSession" as a WHERE a."userId" = $1 AND a."deviceId" = $2`,
      [userId, deviceId],
    );
    if (res.length > 0) {
      return AuthSqlRawDataMapper.toSessionView(res[0]);
    }
    return null;
  }

  async getSessionUuidByUserIdDeviceId(userId: string, deviceId: string): Promise<AuthSessionUuidViewModel | null> {
    if (!isUUID(deviceId)) {
      return null;
    }
    const res = await this.dataSource.query<WithDbId<IAuthSession>[]>(`SELECT * FROM public."AuthSession" as a WHERE a."userId" = $1 AND a."deviceId" = $2`, [
      userId,
      deviceId,
    ]);
    if (res.length > 0) {
      return AuthMongoDataMapper.toSessionUuid(res[0]);
    }
    return null;
  }

  async getSessionByDeviceId(deviceId: string): Promise<AuthSessionByDeviceViewModel | null> {
    if (!isUUID(deviceId)) {
      return null;
    }

    const res = await this.dataSource.query<WithDbId<IAuthSession>[]>(`SELECT * FROM public."AuthSession" as a WHERE a."deviceId" = $1`, [deviceId]);
    if (res.length) {
      return AuthSqlRawDataMapper.toUserSessionByDevice(res[0]);
    }
    return null;
  }
}
