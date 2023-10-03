import { WithId } from 'mongodb';
import { HydratedDocument, Model } from 'mongoose';
import { AuthSessionCreateModel, AuthSessionUpdateModel } from './dto';

export type IAuthSession = {
  deviceId: string;
  userId: string;
  uuid: string;
  ip: string;
  userAgent: string;
  lastActiveDate: Date;
};

export type AuthSessionMongoType = WithId<IAuthSession>;

export type AuthSessionDocumentType = HydratedDocument<IAuthSession, IAuthSessionMethods>;

export interface IAuthSessionMethods {
  updateSession(input: AuthSessionUpdateModel);
}

export interface IAuthSessionModel extends Model<AuthSessionDocumentType, IAuthSessionMethods> {
  createAuthSession(input: AuthSessionCreateModel): AuthSessionDocumentType;
}
