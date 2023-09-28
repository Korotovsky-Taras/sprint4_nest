import { AuthSessionMongoType, IAuthSession } from './dao';
import { IRepository, IService } from '../../types';

export type AuthSessionMapperType<T> = (session: AuthSessionMongoType) => T;
export type AuthSessionListMapperType<T> = (session: AuthSessionMongoType[]) => T[];

export interface IAuthRouterController {}

export interface IAuthSessionQueryRepository {}

export interface IAuthSessionRepository extends IRepository<IAuthSession> {}

export interface IAuthSessionService extends IService {}
