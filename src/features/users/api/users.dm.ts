import {
  UserAuthModel,
  UserAuthWithConfirmationModel,
  UserMeViewModel,
  UserPaginationQueryModel,
  UserPaginationRepositoryModel,
  UserViewModel,
  UserWithConfirmedViewModel,
} from '../types/dto';
import { UserMongoType } from '../types/dao';
import { toIsoString } from '../../../application/utils/date';
import { withExternalDirection, withExternalNumber, withExternalString, withExternalTerm } from '../../../application/utils/withExternalQuery';
import { UserEntityRepo } from '../dao/user-entity.repo';

const initialQuery: UserPaginationRepositoryModel = {
  sortBy: 'createdAt',
  searchEmailTerm: null,
  searchLoginTerm: null,
  sortDirection: 'desc',
  pageNumber: 1,
  pageSize: 10,
};

export class UsersDataMapper {
  static toMeView(input: UserMongoType): UserMeViewModel {
    return {
      userId: input._id.toString(),
      login: input.login,
      email: input.email,
    };
  }
  static toUserView(input: UserMongoType): UserViewModel {
    return {
      id: input._id.toString(),
      login: input.login,
      email: input.email,
      createdAt: toIsoString(input.createdAt),
    };
  }
  static toUserEntityView(input: UserEntityRepo): UserViewModel {
    return {
      id: input._id,
      login: input.login,
      email: input.email,
      createdAt: toIsoString(input.createdAt),
    };
  }
  static toUserAuth(input: UserMongoType): UserAuthModel {
    return {
      id: input._id.toString(),
      login: input.login,
      password: input.password,
      email: input.email,
    };
  }
  static toUsersView(list: UserMongoType[]): UserViewModel[] {
    return list.map((item) => {
      return UsersDataMapper.toUserView(item);
    });
  }
  static toUserWithAuthConfirmation(userModel: UserMongoType): UserWithConfirmedViewModel {
    return {
      ...UsersDataMapper.toUserView(userModel),
      confirmed: userModel.authConfirmation.confirmed,
      confirmationCode: userModel.authConfirmation.code,
    };
  }
  static toUserAuthWithConfirmation(userModel: UserMongoType): UserAuthWithConfirmationModel {
    return {
      ...UsersDataMapper.toUserAuth(userModel),
      confirmed: userModel.authConfirmation.confirmed,
      confirmationCode: userModel.authConfirmation.code,
    };
  }
  static toRepoQuery(query: UserPaginationQueryModel): UserPaginationRepositoryModel {
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
