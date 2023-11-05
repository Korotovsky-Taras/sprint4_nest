import { IAuthSession } from '../types/dao';
import { AuthSessionDataModel, AuthSessionValidationModel, AuthSessionViewModel } from '../types/dto';
import { toIsoString } from '../../../application/utils/date';
import { WithDbId } from '../../../application/utils/types';

export class AuthDataMapper {
  constructor() {}
  static toSessionValidate({ deviceId, uuid }: WithDbId<IAuthSession>): AuthSessionValidationModel {
    return {
      uuid,
      deviceId,
    };
  }
  static toUserSessionValidate({ deviceId, userId, uuid }: WithDbId<IAuthSession>): AuthSessionDataModel {
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
      return AuthDataMapper.toSessionView(session);
    });
  }
}
