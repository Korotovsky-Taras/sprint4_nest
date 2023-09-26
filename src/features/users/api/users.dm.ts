import { UserMeViewDto, UserPaginationQueryDto, UserPaginationRepositoryDto, UserViewDto, UserWithConfirmedViewDto } from '../types/dto';
import { UserMongoType } from '../types/dao';
import { toIsoString } from '../../../utils/date';
import { withExternalDirection, withExternalNumber, withExternalString, withExternalTerm } from '../../../utils/withExternalQuery';

const initialQuery: UserPaginationRepositoryDto = {
  sortBy: 'createdAt',
  searchEmailTerm: null,
  searchLoginTerm: null,
  sortDirection: 'desc',
  pageNumber: 1,
  pageSize: 10,
};

export class UsersDataMapper {
  static toMeView(input: UserMongoType): UserMeViewDto {
    return {
      userId: input._id.toString(),
      login: input.login,
      email: input.email,
    };
  }
  static toUserView(input: UserMongoType): UserViewDto {
    return {
      id: input._id.toString(),
      login: input.login,
      email: input.email,
      createdAt: toIsoString(input.createdAt),
    };
  }
  static toUsersView(list: UserMongoType[]): UserViewDto[] {
    return list.map((item) => {
      return UsersDataMapper.toUserView(item);
    });
  }
  static toUserWithAuthConfirmation(userModel: UserMongoType): UserWithConfirmedViewDto {
    return {
      ...UsersDataMapper.toUserView(userModel),
      confirmed: userModel.authConfirmation.confirmed,
      confirmationCode: userModel.authConfirmation.code,
    };
  }
  static toRepoQuery(query: UserPaginationQueryDto): UserPaginationRepositoryDto {
    return {
      searchLoginTerm: withExternalTerm(initialQuery.searchLoginTerm, query.searchLoginTerm),
      searchEmailTerm: withExternalTerm(initialQuery.searchEmailTerm, query.searchEmailTerm),
      sortBy: withExternalString(initialQuery.sortBy, query.sortBy),
      sortDirection: withExternalDirection(initialQuery.sortDirection, query.sortDirection),
      pageNumber: withExternalNumber(initialQuery.pageNumber, query.pageNumber),
      pageSize: withExternalNumber(initialQuery.pageSize, query.pageSize),
    };
  }
}
