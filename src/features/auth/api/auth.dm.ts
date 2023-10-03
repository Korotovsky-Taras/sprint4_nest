import { AuthSessionMongoType } from '../types/dao';
import { AuthSessionDataModel, AuthSessionValidationModel, AuthSessionViewModel } from '../types/dto';
import { toIsoString } from '../../../application/utils/date';

export class AuthDataMapper {
  constructor() {}
  static toSessionValidate({ deviceId, uuid }: AuthSessionMongoType): AuthSessionValidationModel {
    return {
      uuid,
      deviceId,
    };
  }
  static toUserSessionValidate({ deviceId, userId, uuid }: AuthSessionMongoType): AuthSessionDataModel {
    return {
      uuid,
      userId,
      deviceId,
    };
  }
  static toSessionView({ deviceId, lastActiveDate, ip, userAgent }: AuthSessionMongoType): AuthSessionViewModel {
    return {
      ip,
      lastActiveDate: toIsoString(lastActiveDate),
      title: userAgent,
      deviceId,
    };
  }
  static toSessionsView(sessions: AuthSessionMongoType[]): AuthSessionViewModel[] {
    return sessions.map((session) => {
      return AuthDataMapper.toSessionView(session);
    });
  }
}
