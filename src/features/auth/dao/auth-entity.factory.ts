import { AuthEntityRepo } from './auth-entity.repo';
import { AuthSessionDocumentType } from '../types/dao';
import { AuthSessionUpdateModel } from '../types/dto';
import { AuthRawSqlResult } from './sql-raw/auth.raw-sql.result';

export class AuthEntityFactory {
  static createSqlRawEntity(auth: AuthRawSqlResult): AuthEntityRepo {
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
  static createMongoEntity(auth: AuthSessionDocumentType, onSave: () => Promise<void>): AuthEntityRepo {
    return new AuthEntityRepo({
      _id: auth._id.toString(),
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
}
