import { WithId } from 'mongodb';
import { HydratedDocument, Model } from 'mongoose';
import { AuthSessionCreateDto, AuthSessionUpdateDto } from './dto';

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
  updateSession(input: AuthSessionUpdateDto);
}

export interface IAuthSessionModel extends Model<AuthSessionDocumentType, IAuthSessionMethods> {
  createAuthSession(input: AuthSessionCreateDto): AuthSessionDocumentType;
}
