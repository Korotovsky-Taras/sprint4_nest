import { Injectable } from '@nestjs/common';
import { AuthSessionListMapperType, AuthSessionMapperType, IAuthSessionQueryRepository } from '../../types/common';
import { IAuthSession } from '../../types/dao';
import { DataSource } from 'typeorm';
import { WithDbId } from '../../../../application/utils/types';
import { InjectDataSource } from '@nestjs/typeorm';
import { isUUID } from 'class-validator';

@Injectable()
export class AuthRawSqlSessionQueryRepository implements IAuthSessionQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getAll<T>(userId: string, mapper: AuthSessionListMapperType<T>): Promise<T[]> {
    const res = await this.dataSource.query<WithDbId<IAuthSession>[]>(`SELECT * FROM public."AuthSession" as a WHERE a."userId" = $1`, [userId]);
    return mapper(res);
  }

  async getSessionByUserIdDeviceId<T>(userId: string, deviceId: string, mapper: AuthSessionMapperType<T>): Promise<T | null> {
    if (!isUUID(deviceId)) {
      return null;
    }
    const res = await this.dataSource.query<WithDbId<IAuthSession>[]>(`SELECT * FROM public."AuthSession" as a WHERE a."userId" = $1 AND a."deviceId" = $2`, [
      userId,
      deviceId,
    ]);
    if (res.length > 0) {
      return mapper(res[0]);
    }
    return null;
  }

  async isSessionByDeviceIdExist(deviceId: string): Promise<boolean> {
    const res = await this.dataSource.query<WithDbId<IAuthSession>[]>(`SELECT * FROM public."AuthSession" as a WHERE a."deviceId" = $1`, [deviceId]);
    return res.length > 0;
  }

  async getSessionByDeviceId<T>(deviceId: string, mapper: AuthSessionMapperType<T>): Promise<T | null> {
    if (!isUUID(deviceId)) {
      return null;
    }

    const res = await this.dataSource.query<WithDbId<IAuthSession>[]>(`SELECT * FROM public."AuthSession" as a WHERE a."deviceId" = $1`, [deviceId]);
    if (res.length) {
      return mapper(res[0]);
    }
    return null;
  }
}
