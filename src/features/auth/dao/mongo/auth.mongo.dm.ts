import { IAuthSession } from '../../types/dao';
import { AuthSessionByDeviceViewModel, AuthSessionUuidViewModel, AuthSessionViewModel } from '../../types/dto';
import { toIsoString } from '../../../../application/utils/date';
import { WithDbId } from '../../../../application/utils/types';

export class AuthMongoDataMapper {
  constructor() {}
  static toSessionUuid({ uuid }: WithDbId<IAuthSession>): AuthSessionUuidViewModel {
    return {
      uuid,
    };
  }
  static toUserSessionByDevice({ deviceId, userId, uuid }: WithDbId<IAuthSession>): AuthSessionByDeviceViewModel {
    return {
      uuid,
      userId,
      deviceId,
    };
  }
  static toSessionView({ deviceId, lastActiveDate, ip, userAgent }: WithDbId<IAuthSession>): AuthSessionViewModel {
    return {
      ip,
      lastActiveDate: toIsoString(lastActiveDate),
      title: userAgent,
      deviceId,
    };
  }
  static toSessionsView(sessions: WithDbId<IAuthSession>[]): AuthSessionViewModel[] {
    return sessions.map((session) => {
      return AuthMongoDataMapper.toSessionView(session);
    });
  }
}
