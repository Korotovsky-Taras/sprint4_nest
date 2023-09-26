import { IUser } from './dao';
import { EnhancedOmit, PaginationQueryModel, WithPagination, WithPaginationQuery } from '../../../utils/types';

export type UserCreateRequestDto = Pick<IUser, 'login' | 'email'> & { password: string };

export type UserCreateInputDto = Pick<IUser, 'login' | 'email' | 'password' | 'authConfirmation'>;

export type UserViewDto = Pick<IUser, 'login' | 'email'> & { id: string; createdAt: string };

export type UserMeViewDto = Pick<IUser, 'login' | 'email'> & { userId: string };

export type UserWithConfirmedViewDto = Pick<IUser, 'login' | 'email'> & { id: string; confirmationCode: string; confirmed: boolean; createdAt: string };

export type UserListViewDto = WithPagination<UserViewDto>;

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
