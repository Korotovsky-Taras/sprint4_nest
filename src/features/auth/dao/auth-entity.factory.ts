import { AuthEntityRepo } from './auth-entity.repo';
import { AuthSessionDocumentType } from '../types/dao';
import { AuthSessionUpdateModel } from '../types/dto';
import { AuthSqlRawResult } from './sql-raw/auth.sql-raw.result';
import { AuthEntity } from './sql-orm/auth.entity';

export class AuthEntityFactory {
  static createMongoEntity(auth: AuthSessionDocumentType, onSave: () => Promise<void>): AuthEntityRepo {
    return new AuthEntityRepo({
      _id: String(auth._id),
      userId: auth.userId,
      deviceId: auth.deviceId,
      uuid: auth.uuid,
      ip: auth.ip,
      userAgent: auth.userAgent,
      lastActiveDate: auth.lastActiveDate,
      updateSession(input: AuthSessionUpdateModel) {
        auth.updateSession(input);
      },
      save(): Promise<void> {
        return onSave();
      },
    });
  }
  static createSqlOrmEntity(auth: AuthEntity, onSave: () => Promise<void>): AuthEntityRepo {
    return new AuthEntityRepo({
      _id: String(auth._id),
      userId: String(auth.userId),
      deviceId: auth.deviceId,
      uuid: auth.uuid,
      ip: auth.ip,
      userAgent: auth.userAgent,
      lastActiveDate: auth.lastActiveDate,
      updateSession(input: AuthSessionUpdateModel) {
        auth.updateSession(input);
      },
      save(): Promise<void> {
        return onSave();
      },
    });
  }
  static createSqlRawEntity(auth: AuthSqlRawResult): AuthEntityRepo {
    return new AuthEntityRepo({
      _id: auth._id,
      userId: auth.userId,
      deviceId: auth.deviceId,
      uuid: auth.uuid,
      ip: auth.ip,
      userAgent: auth.userAgent,
      lastActiveDate: auth.lastActiveDate,
      updateSession(input: AuthSessionUpdateModel) {
        auth.updateSession(input);
      },
      save(): Promise<void> {
        return auth.applyCommands();
      },
    });
  }
}
