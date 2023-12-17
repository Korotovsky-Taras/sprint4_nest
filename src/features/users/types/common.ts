import { UserConfirmation } from './dao';
import { IRepository, IService } from '../../types';
import { UserConfirmationCodeValidateResult, UserCreateInputModel, UserCreateModel, UserListViewModel, UserMeViewModel, UserViewModel } from './dto';
import { WithPagination } from '../../../application/utils/types';
import { UserPaginationQueryDto } from '../dto/UserPaginationQueryDto';
import { UserEntityRepo } from '../dao/user-entity.repo';

export interface IUsersService extends IService {}

export interface IUsersAdminController {
  getAll(query: UserPaginationQueryDto): Promise<UserListViewModel>;
  createUser(input: UserCreateModel): Promise<UserViewModel>;
  deleteUser(userId: string);
}

export const UserRepoKey = Symbol('USERS_REPO');

export interface IUsersRepository<T> extends IRepository<T> {
  isUserAuthConfirmed(userId: string): Promise<boolean>;
  deleteUserById(userId: string): Promise<boolean>;
  isUserExist(userId: string): Promise<boolean>;
  createUser(model: UserCreateInputModel): Promise<UserEntityRepo>;
  getUserByLoginOrEmail(login: string, email: string): Promise<UserEntityRepo | null>;
  getUserByAuthConfirmationCode(code: string): Promise<UserEntityRepo | null>;
  getUserByPassConfirmationCode(code: string): Promise<UserEntityRepo | null>;
  getUserById(userId: string): Promise<UserEntityRepo | null>;
  getUserByEmail(email: string): Promise<UserEntityRepo | null>;
}

export const UserQueryRepoKey = Symbol('USERS_QUERY_REPO');

export interface IUsersQueryRepository {
  getUsers(query: UserPaginationQueryDto): Promise<WithPagination<UserViewModel>>;
  getUserById(userId: string): Promise<UserMeViewModel | null>;
  isUserExistByLoginOrEmail(login: string, email: string): Promise<boolean>;
  getAuthConfirmationValidation(code: string): Promise<UserConfirmationCodeValidateResult | null>;
  getPassConfirmationValidation(code: string): Promise<UserConfirmationCodeValidateResult | null>;
  getUserRegistrationConfirmationByEmail(email: string): Promise<UserConfirmation | null>;
}
