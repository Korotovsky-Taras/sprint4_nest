import { AuthSessionMongoType } from '../types/dao';
import { AuthSessionDataDto, AuthSessionValidationDto, AuthSessionViewDto } from '../types/dto';
import { toIsoString } from '../../../application/utils/date';

export class AuthDataMapper {
  constructor() {}
  static toSessionValidate({ _id, uuid }: AuthSessionMongoType): AuthSessionValidationDto {
    return {
      uuid,
      deviceId: _id.toString(),
    };
  }
  static toUserSessionValidate({ _id, userId, uuid }: AuthSessionMongoType): AuthSessionDataDto {
    return {
      uuid,
      userId,
      deviceId: _id.toString(),
    };
  }
  static toSessionView({ _id, lastActiveDate, ip, userAgent }: AuthSessionMongoType): AuthSessionViewDto {
    return {
      ip,
      lastActiveDate: toIsoString(lastActiveDate),
      title: userAgent,
      deviceId: _id.toString(),
    };
  }
  static toSessionsView(sessions: AuthSessionMongoType[]): AuthSessionViewDto[] {
    return sessions.map((session) => {
      return AuthDataMapper.toSessionView(session);
    });
  }
}
