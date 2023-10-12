import { IUser, UserDocumentType, UserMongoType } from './dao';
import { IRepository, IService } from '../../types';
import {
  UserConfirmationCodeValidateResult,
  UserCreateModel,
  UserListViewModel,
  UserPaginationQueryModel,
  UserPaginationRepositoryDto,
  UserViewModel,
} from './dto';
import { WithPagination } from '../../../application/utils/types';
import { FilterQuery } from 'mongoose';

export type UserMapperType<T> = (post: UserMongoType) => T;
export type UserListMapperType<T> = (post: UserMongoType[]) => T[];

export interface IUsersService extends IService {}

export interface IUsersController {
  getAll(query: UserPaginationQueryModel): Promise<UserListViewModel>;
  createUser(input: UserCreateModel): Promise<UserViewModel>;
  deleteUser(userId: string);
}

export interface IUsersRepository extends IRepository<IUser> {
  isUserAuthConfirmed(userId: string): Promise<boolean>;
  getUserById(userId: string): Promise<UserDocumentType | null>;
  isUserExist(userId: string): Promise<boolean>;
  getUserByLoginOrEmail(login: string, email: string): Promise<UserMongoType | null>;
}

export interface IUsersQueryRepository {
  getUsers<T>(query: UserPaginationRepositoryDto, mapper: UserListMapperType<T>): Promise<WithPagination<T>>;
  getUserById<T>(userId: string, mapper: UserMapperType<T>): Promise<T | null>;
  isUserExistByLoginOrEmail(login: string, email: string): Promise<boolean>;
  getUserByLoginOrEmail<T>(login: string, email: string, mapper: UserMapperType<T>): Promise<T | null>;
  getAuthConfirmationValidation(code: string): Promise<UserConfirmationCodeValidateResult | null>;
  getPassConfirmationValidation(code: string): Promise<UserConfirmationCodeValidateResult | null>;
  getUserByFilter<T>(filter: FilterQuery<UserMongoType>, mapper: UserMapperType<T>): Promise<T | null>;
}
