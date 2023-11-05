import { AuthRepoType, IAuthSession, IAuthSessionMethods } from '../types/dao';
import { EntityRepo } from '../../entity.repo';
import { AuthSessionUpdateModel } from '../types/dto';

export class AuthEntityRepo extends EntityRepo implements IAuthSession, IAuthSessionMethods {
  constructor(private readonly auth: AuthRepoType) {
    super();
  }

  get _id() {
    return this.auth._id;
  }

  get deviceId() {
    return this.auth.deviceId;
  }

  get userId() {
    return this.auth.userId;
  }

  get uuid() {
    return this.auth.uuid;
  }

  get ip() {
    return this.auth.ip;
  }

  get userAgent() {
    return this.auth.userAgent;
  }

  get lastActiveDate() {
    return this.auth.lastActiveDate;
  }

  async save(): Promise<void> {
    await this.auth.save();
  }

  updateSession(input: AuthSessionUpdateModel) {
    this.auth.updateSession(input);
  }
}
