import { UserMeViewModel, UserViewModel } from '../../types/dto';
import { UserMongoType } from '../../types/dao';
import { toIsoString } from '../../../../application/utils/date';
import { UserEntityRepo } from '../user-entity.repo';

export class UsersMongoDataMapper {
  static toMeView(input: UserMongoType): UserMeViewModel {
    return {
      userId: input._id.toString(),
      login: input.login,
      email: input.email,
    };
  }
  static toUserView(input: UserMongoType): UserViewModel {
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
  static toUsersView(list: UserMongoType[]): UserViewModel[] {
    return list.map((item) => {
      return UsersMongoDataMapper.toUserView(item);
    });
  }
}
