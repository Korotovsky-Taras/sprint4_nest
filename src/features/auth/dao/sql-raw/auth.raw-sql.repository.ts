import { Injectable } from '@nestjs/common';
import { IAuthSession } from '../../types/dao';
import { IAuthSessionRepository } from '../../types/common';
import { AuthSessionCreateModel, AuthSessionInfoModel } from '../../types/dto';
import { DataSource } from 'typeorm';
import { WithDbId } from '../../../../application/utils/types';
import { AuthEntityRepo } from '../auth-entity.repo';
import { AuthEntityFactory } from '../auth-entity.factory';
import { AuthRawSqlResult } from './auth.raw-sql.result';
import { InjectDataSource } from '@nestjs/typeorm';

@Injectable()
export class AuthRawSqlSessionRepository implements IAuthSessionRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createSession(input: AuthSessionCreateModel): Promise<string> {
    const res = await this.dataSource.query<WithDbId<IAuthSession>[]>(
      `INSERT INTO public."AuthSession" ("userId", "deviceId", "uuid", "ip", "userAgent", "lastActiveDate") VALUES ($1, $2, $3, $4, $5, $6) RETURNING "_id"`,
      [input.userId, input.deviceId, input.uuid, input.ip, input.userAgent, input.lastActiveDate],
    );
    return res[0]._id;
  }

  async deleteSession(input: AuthSessionInfoModel): Promise<boolean> {
    const [, count] = await this.dataSource.query(`DELETE FROM public."AuthSession" as u WHERE u."userId" = $1 AND u."deviceId" = $2`, [
      input.userId,
      input.deviceId,
    ]);
    return count > 0;
  }

  async getSessionByDeviceId(deviceId: string): Promise<AuthEntityRepo | null> {
    const res = await this.dataSource.query<WithDbId<IAuthSession>[]>(`SELECT * FROM public."AuthSession" as a WHERE a."deviceId" = $1`, [deviceId]);
    if (res.length > 0) {
      return AuthEntityFactory.createSqlRawEntity(new AuthRawSqlResult(this.dataSource, res[0]));
    }
    return null;
  }

  async deleteAllSessions(input: AuthSessionInfoModel): Promise<boolean> {
    const [, count] = await this.dataSource.query(`DELETE FROM public."AuthSession" as u WHERE u."userId" = $1 AND NOT u."deviceId" = $2`, [
      input.userId,
      input.deviceId,
    ]);
    return count > 0;
  }

  async isSessionByDeviceIdExist(deviceId: string): Promise<boolean> {
    const res = await this.dataSource.query<WithDbId<IAuthSession>[]>(`SELECT * FROM public."AuthSession" as a WHERE a."deviceId" = $1`, [deviceId]);
    return res.length > 0;
  }

  async saveDoc(): Promise<void> {}

  async clear(): Promise<void> {
    await this.dataSource.query(`TRUNCATE TABLE public."AuthSession" CASCADE`);
  }
}
