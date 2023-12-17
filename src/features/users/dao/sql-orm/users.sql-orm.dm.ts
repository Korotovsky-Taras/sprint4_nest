import { UserMeViewModel, UserViewModel } from '../../types/dto';
import { toIsoString } from '../../../../application/utils/date';
import { UserEntityRepo } from '../user-entity.repo';
import { WithDbId } from '../../../../application/utils/types';
import { IUser } from '../../types/dao';

export class UsersSqlOrmDataMapper {
  static toMeView(input: WithDbId<IUser>): UserMeViewModel {
    return {
      userId: input._id.toString(),
      login: input.login,
      email: input.email,
    };
  }
  static toUserView(input: WithDbId<IUser>): UserViewModel {
    return {
      id: String(input._id),
      login: input.login,
      email: input.email,
      createdAt: toIsoString(input.createdAt),
    };
  }
  static toUserEntityView(input: UserEntityRepo): UserViewModel {
    return {
      id: String(input._id),
      login: input.login,
      email: input.email,
      createdAt: toIsoString(input.createdAt),
    };
  }
  static toUsersView(list: WithDbId<IUser>[]): UserViewModel[] {
    return list.map((item) => {
      return UsersSqlOrmDataMapper.toUserView(item);
    });
  }
}
