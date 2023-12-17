import { IAuthSession } from '../../types/dao';
import { AuthSessionByDeviceViewModel, AuthSessionUuidViewModel, AuthSessionViewModel } from '../../types/dto';
import { toIsoString } from '../../../../application/utils/date';
import { WithDbId } from '../../../../application/utils/types';

export class AuthSqlRawDataMapper {
  constructor() {}
  static toSessionUuid({ uuid }: WithDbId<IAuthSession>): AuthSessionUuidViewModel {
    return {
      uuid,
    };
  }
  static toUserSessionByDevice({ deviceId, userId, uuid }: WithDbId<IAuthSession>): AuthSessionByDeviceViewModel {
    return {
      uuid,
      userId: String(userId),
      deviceId: String(deviceId),
    };
  }
  static toSessionView({ deviceId, lastActiveDate, ip, userAgent }: WithDbId<IAuthSession>): AuthSessionViewModel {
    return {
      ip,
      lastActiveDate: toIsoString(lastActiveDate),
      title: userAgent,
      deviceId: String(deviceId),
    };
  }
  static toSessionsView(sessions: WithDbId<IAuthSession>[]): AuthSessionViewModel[] {
    return sessions.map((session) => {
      return AuthSqlRawDataMapper.toSessionView(session);
    });
  }
}
