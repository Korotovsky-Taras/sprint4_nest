import { IRepository, IService } from '../../types';
import { AuthSessionByDeviceViewModel, AuthSessionCreateModel, AuthSessionInfoModel, AuthSessionUuidViewModel, AuthSessionViewModel } from './dto';
import { AuthEntityRepo } from '../dao/auth-entity.repo';

export interface IAuthRouterController {}

export const AuthRepoQueryKey = Symbol('AUTH_QUERY_REPO');

export interface IAuthSessionQueryRepository {
  getAll(userId: string): Promise<AuthSessionViewModel[]>;
  getSessionByUserIdDeviceId(userId: string, deviceId: string): Promise<AuthSessionViewModel | null>;
  getSessionUuidByUserIdDeviceId(userId: string, deviceId: string): Promise<AuthSessionUuidViewModel | null>;
  getSessionByDeviceId(deviceId: string): Promise<AuthSessionByDeviceViewModel | null>;
}

export const AuthRepoKey = Symbol('AUTH_REPO');

export interface IAuthSessionRepository<T> extends IRepository<T> {
  createSession(input: AuthSessionCreateModel): Promise<string>;
  deleteSession(input: AuthSessionInfoModel): Promise<boolean>;
  getSessionByDeviceId(deviceId: string): Promise<AuthEntityRepo | null>;
  deleteAllSessions(model: AuthSessionInfoModel): Promise<boolean>;
  isSessionByDeviceIdExist(deviceId: string): Promise<boolean>;
}

export interface IAuthSessionService extends IService {}
