import { IUser } from './dao';
import { WithPagination } from '../../../application/utils/types';

export type UserCreateModel = Pick<IUser, 'login' | 'email'> & { password: string };

export type UserCreateInputModel = Pick<IUser, 'login' | 'email' | 'password' | 'authConfirmation'>;

export type UserViewModel = Pick<IUser, 'login' | 'email'> & { id: string; createdAt: string };

export type UserMeViewModel = Pick<IUser, 'login' | 'email'> & { userId: string };

export type UserListViewModel = WithPagination<UserViewModel>;

export type UserConfirmationCodeValidateResult = {
  isConfirmed: boolean;
  isExpired: boolean;
};
