import { WithId } from 'mongodb';
import { HydratedDocument, Model } from 'mongoose';
import { UserCreateInputModel } from './dto';
import { RepoEntityMethods } from '../../entity.repo';

export type IUser = {
  login: string;
  email: string;
  password: UserEncodedPassword;
  authConfirmation: UserConfirmation;
  passConfirmation: UserConfirmation;
  createdAt: Date;
};

export type UserConfirmation = {
  expiredIn: Date;
  code: string;
  confirmed: boolean;
};

export type UserEncodedPassword = {
  salt: string;
  hash: string;
};

export type UserMongoType = WithId<IUser>;

export type UserDocumentType = HydratedDocument<IUser, IUserMethods>;

export type UserRepoType = IUser & { _id: string } & IUserMethods & RepoEntityMethods;

export interface IUserMethods {
  isAuthConfirmed(): boolean;
  isAuthExpired(): boolean;
  isPassConfirmed(): boolean;
  isPassExpired(): boolean;
  setPassword(password: UserEncodedPassword): void;
  setAuthConfirmed(confirm: boolean): void;
  setPassConfirmed(confirm: boolean): void;
  setAuthConfirmation(conf: UserConfirmation): void;
  setPassConfirmation(conf: UserConfirmation): void;
}

export interface IUserModel extends Model<UserDocumentType, IUserMethods> {
  createUser(input: UserCreateInputModel): UserDocumentType;
}
