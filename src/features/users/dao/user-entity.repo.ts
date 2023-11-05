import { IUser, IUserMethods, UserConfirmation, UserEncodedPassword, UserRepoType } from '../types/dao';
import { RepoEntityMethods } from '../../entity.repo';

export class UserEntityRepo implements IUserMethods, RepoEntityMethods {
  constructor(private readonly user: UserRepoType) {}

  get _id() {
    return this.user._id;
  }

  get email() {
    return this.user.email;
  }

  get login() {
    return this.user.login;
  }

  get password() {
    return this.user.password;
  }

  get authConfirmation() {
    return this.user.authConfirmation;
  }

  get passConfirmation() {
    return this.user.passConfirmation;
  }

  get createdAt() {
    return this.user.createdAt;
  }

  async save(): Promise<void> {
    await this.user.save();
  }

  getUser(): IUser & { _id: string } {
    return this.user;
  }

  isAuthConfirmed(): boolean {
    return this.user.isAuthConfirmed();
  }

  isAuthExpired(): boolean {
    return this.user.isAuthExpired();
  }

  isPassConfirmed(): boolean {
    return this.user.isPassConfirmed();
  }

  isPassExpired(): boolean {
    return this.user.isPassExpired();
  }

  setAuthConfirmation(conf: UserConfirmation): void {
    this.user.setAuthConfirmation(conf);
  }

  setAuthConfirmed(confirm: boolean): void {
    this.user.setAuthConfirmed(confirm);
  }

  setPassConfirmation(conf: UserConfirmation): void {
    this.user.setPassConfirmation(conf);
  }

  setPassConfirmed(confirm: boolean): void {
    this.user.setPassConfirmed(confirm);
  }

  setPassword(password: UserEncodedPassword): void {
    this.user.setPassword(password);
  }
}
