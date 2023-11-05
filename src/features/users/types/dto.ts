import { IUser } from './dao';
import { EnhancedOmit, PaginationQueryModel, WithPagination, WithPaginationQuery } from '../../../application/utils/types';

export type UserCreateModel = Pick<IUser, 'login' | 'email'> & { password: string };

export type UserCreateInputModel = Pick<IUser, 'login' | 'email' | 'password' | 'authConfirmation'>;

export type UserViewModel = Pick<IUser, 'login' | 'email'> & { id: string; createdAt: string };

export type UserAuthModel = Pick<IUser, 'login' | 'email' | 'password'> & { id: string };

export type UserMeViewModel = Pick<IUser, 'login' | 'email'> & { userId: string };

export type UserWithConfirmedViewModel = Pick<IUser, 'login' | 'email'> & { id: string; confirmationCode: string; confirmed: boolean; createdAt: string };

export type UserAuthWithConfirmationModel = UserAuthModel & { confirmationCode: string; confirmed: boolean };

export type UserListViewModel = WithPagination<UserViewModel>;

export type UserPaginationQueryModel = PaginationQueryModel<IUser> & {
  searchLoginTerm?: string;
  searchEmailTerm?: string;
};

export type UserPaginationRepositoryModel = EnhancedOmit<WithPaginationQuery, 'searchLoginTerm' | 'searchEmailTerm'> & {
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;
};

export type UserConfirmationCodeValidateResult = {
  isConfirmed: boolean;
  isExpired: boolean;
};
