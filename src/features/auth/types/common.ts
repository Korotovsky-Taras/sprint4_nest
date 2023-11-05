import { IAuthSession } from './dao';
import { IRepository, IService } from '../../types';
import { WithDbId } from '../../../application/utils/types';
import { AuthSessionCreateModel, AuthSessionInfoModel } from './dto';
import { AuthEntityRepo } from '../dao/auth-entity.repo';

export type AuthSessionMapperType<T> = (session: WithDbId<IAuthSession>) => T;
export type AuthSessionListMapperType<T> = (session: WithDbId<IAuthSession>[]) => T[];

export interface IAuthRouterController {}

export const AuthRepoQueryKey = Symbol('AUTH_QUERY_REPO');

export interface IAuthSessionQueryRepository {
  getAll<T>(userId: string, mapper: AuthSessionListMapperType<T>): Promise<T[]>;
  getSessionByUserIdDeviceId<T>(userId: string, deviceId: string, mapper: AuthSessionMapperType<T>): Promise<T | null>;
  getSessionByDeviceId<T>(deviceId: string, mapper: AuthSessionMapperType<T>): Promise<T | null>;
}

export const AuthRepoKey = Symbol('AUTH_REPO');

export interface IAuthSessionRepository extends IRepository<IAuthSession> {
  createSession(input: AuthSessionCreateModel): Promise<string>;
  deleteSession(input: AuthSessionInfoModel): Promise<boolean>;
  getSessionByDeviceId(deviceId: string): Promise<AuthEntityRepo | null>;
  deleteAllSessions(model: AuthSessionInfoModel): Promise<boolean>;
  isSessionByDeviceIdExist(deviceId: string): Promise<boolean>;
}

export interface IAuthSessionService extends IService {}
