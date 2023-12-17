import { AuthSessionByDeviceViewModel, AuthSessionUuidViewModel, AuthSessionViewModel } from '../../types/dto';
import { toIsoString } from '../../../../application/utils/date';
import { AuthEntity } from './auth.entity';

export class AuthSqlOrmDataMapper {
  constructor() {}
  static toSessionUuid({ uuid }: AuthEntity): AuthSessionUuidViewModel {
    return {
      uuid,
    };
  }

  static toUserSessionByDevice({ deviceId, userId, uuid }: AuthEntity): AuthSessionByDeviceViewModel {
    return {
      uuid,
      userId: String(userId),
      deviceId: String(deviceId),
    };
  }

  static toSessionView({ deviceId, lastActiveDate, ip, userAgent }: AuthEntity): AuthSessionViewModel {
    return {
      ip,
      lastActiveDate: toIsoString(lastActiveDate),
      title: userAgent,
      deviceId: String(deviceId),
    };
  }

  static toSessionsView(sessions: AuthEntity[]): AuthSessionViewModel[] {
    return sessions.map((session) => {
      return AuthSqlOrmDataMapper.toSessionView(session);
    });
  }
}
