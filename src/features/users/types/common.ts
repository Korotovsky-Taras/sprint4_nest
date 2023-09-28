import { IUser, UserMongoType } from './dao';
import { IRepository, IService } from '../../types';
import {
  UserConfirmationCodeValidateResult,
  UserCreateRequestDto,
  UserListViewDto,
  UserPaginationQueryDto,
  UserPaginationRepositoryDto,
  UserViewDto,
} from './dto';
import { WithPagination } from '../../../application/utils/types';
import { FilterQuery } from 'mongoose';

export type UserMapperType<T> = (post: UserMongoType) => T;
export type UserListMapperType<T> = (post: UserMongoType[]) => T[];

export interface IUsersService extends IService {}

export interface IUsersController {
  getAll(query: UserPaginationQueryDto): Promise<UserListViewDto>;
  createUser(input: UserCreateRequestDto): Promise<UserViewDto>;
  deleteUser(userId: string);
}

export interface IUsersRepository extends IRepository<IUser> {}

export interface IUsersQueryRepository {
  getUsers<T>(query: UserPaginationRepositoryDto, dto: UserListMapperType<T>): Promise<WithPagination<T>>;
  getUserById<T>(userId: string, dto: UserMapperType<T>): Promise<T | null>;
  isUserExist(userId: string): Promise<boolean>;
  isUserExistByLoginOrEmail(login: string, email: string): Promise<boolean>;
  getUserByLoginOrEmail<T>(login: string, email: string, dto: UserMapperType<T>): Promise<T | null>;
  getAuthConfirmationValidation(code: string): Promise<UserConfirmationCodeValidateResult | null>;
  getPassConfirmationValidation(code: string): Promise<UserConfirmationCodeValidateResult | null>;
  getUserByFilter<T>(filter: FilterQuery<UserMongoType>, dto: UserMapperType<T>): Promise<T | null>;
}
