import { WithId } from 'mongodb';
import { HydratedDocument, Model } from 'mongoose';
import { UserCreateInputModel } from './dto';

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

export type UserConfirmationMongoType = WithId<UserConfirmation>;

export type UserDocumentType = HydratedDocument<IUser, IUserMethods>;

export interface IUserMethods {
  isAuthConfirmed(): boolean;
  isAuthExpired(): boolean;
  isPassConfirmed(): boolean;
  isPassExpired(): boolean;
  setAuthConfirmed(confirm: boolean): void;
  setPassConfirmed(confirm: boolean): void;
  setAuthConfirmation(conf: UserConfirmation): UserConfirmationMongoType;
  setPassConfirmation(conf: UserConfirmation): UserConfirmationMongoType;
}

export interface IUserModel extends Model<UserDocumentType, IUserMethods> {
  createUser(input: UserCreateInputModel): UserDocumentType;
}
