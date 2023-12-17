import { IAuthSession, IAuthSessionMethods } from '../../types/dao';
import { DataSource } from 'typeorm';
import { WithDbId } from '../../../../application/utils/types';
import { EntityRepoResult } from '../../../entity.repo.result';
import { AuthSessionUpdateModel } from '../../types/dto';

export class AuthSqlRawResult extends EntityRepoResult implements IAuthSession, IAuthSessionMethods {
  _id: string;
  deviceId: string;
  userId: string;
  uuid: string;
  ip: string;
  userAgent: string;
  lastActiveDate: Date;

  constructor(
    private readonly dataSource: DataSource,
    private readonly auth: WithDbId<IAuthSession>,
  ) {
    super();
    this._id = auth._id;
    this.deviceId = auth.deviceId;
    this.userId = auth.userId;
    this.uuid = auth.uuid;
    this.ip = auth.ip;
    this.userAgent = auth.userAgent;
    this.lastActiveDate = auth.lastActiveDate;
  }

  updateSession(input: AuthSessionUpdateModel) {
    this.addCommand(async () => {
      await this.dataSource.query(
        `UPDATE public."AuthSession" as a SET "ip" = $3, "userAgent"= $4 , "uuid" = $5, "lastActiveDate" = $6 WHERE a."userId" = $1 AND a."deviceId" = $2`,
        [this.userId, this.deviceId, input.ip, input.userAgent, input.uuid, input.lastActiveDate],
      );
      this.ip = input.ip;
      this.userAgent = input.userAgent;
      this.uuid = input.uuid;
      this.lastActiveDate = input.lastActiveDate;
    });
  }
}
