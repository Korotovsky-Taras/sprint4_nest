import { IUser } from './dao';
import { EnhancedOmit, PaginationQueryModel, WithPagination, WithPaginationQuery } from '../../../application/utils/types';

export type UserCreateModel = Pick<IUser, 'login' | 'email'> & { password: string };

export type UserCreateInputDto = Pick<IUser, 'login' | 'email' | 'password' | 'authConfirmation'>;

export type UserViewModel = Pick<IUser, 'login' | 'email'> & { id: string; createdAt: string };

export type UserAuthDto = Pick<IUser, 'login' | 'email' | 'password'> & { id: string };

export type UserMeViewDto = Pick<IUser, 'login' | 'email'> & { userId: string };

export type UserWithConfirmedViewDto = Pick<IUser, 'login' | 'email'> & { id: string; confirmationCode: string; confirmed: boolean; createdAt: string };

export type UserAuthWithConfirmationDto = UserAuthDto & { confirmationCode: string; confirmed: boolean };

export type UserListViewDto = WithPagination<UserViewModel>;

export type UserPaginationQueryDto = PaginationQueryModel<IUser> & {
  searchLoginTerm?: string;
  searchEmailTerm?: string;
};

export type UserPaginationRepositoryDto = EnhancedOmit<WithPaginationQuery<IUser>, 'searchLoginTerm' | 'searchEmailTerm'> & {
  searchLoginTerm: string | null;
  searchEmailTerm: string | null;
};

export type UserConfirmationCodeValidateResult = {
  isConfirmed: boolean;
  isExpired: boolean;
};
