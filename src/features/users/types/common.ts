import { IUser, UserMongoType } from './dao';
import { IRepository, IService } from '../../types';
import {
  UserConfirmationCodeValidateResult,
  UserCreateModel,
  UserListViewDto,
  UserPaginationQueryDto,
  UserPaginationRepositoryDto,
  UserViewModel,
} from './dto';
import { WithPagination } from '../../../application/utils/types';
import { FilterQuery } from 'mongoose';

export type UserMapperType<T> = (post: UserMongoType) => T;
export type UserListMapperType<T> = (post: UserMongoType[]) => T[];

export interface IUsersService extends IService {}

export interface IUsersController {
  getAll(query: UserPaginationQueryDto): Promise<UserListViewDto>;
  createUser(input: UserCreateModel): Promise<UserViewModel>;
  deleteUser(userId: string);
}

export interface IUsersRepository extends IRepository<IUser> {}

export interface IUsersQueryRepository {
  getUsers<T>(query: UserPaginationRepositoryDto, mapper: UserListMapperType<T>): Promise<WithPagination<T>>;
  getUserById<T>(userId: string, mapper: UserMapperType<T>): Promise<T | null>;
  isUserExist(userId: string): Promise<boolean>;
  isUserExistByLoginOrEmail(login: string, email: string): Promise<boolean>;
  getUserByLoginOrEmail<T>(login: string, email: string, mapper: UserMapperType<T>): Promise<T | null>;
  getAuthConfirmationValidation(code: string): Promise<UserConfirmationCodeValidateResult | null>;
  getPassConfirmationValidation(code: string): Promise<UserConfirmationCodeValidateResult | null>;
  getUserByFilter<T>(filter: FilterQuery<UserMongoType>, mapper: UserMapperType<T>): Promise<T | null>;
}
