import { UserEntityRepo } from './user-entity.repo';
import { UserConfirmation, UserDocumentType, UserEncodedPassword } from '../types/dao';
import { UserSqlRawResult } from './sql-raw/users.sql-raw.result';

export class UserEntityFactory {
  static createSqlRawEntity(user: UserSqlRawResult): UserEntityRepo {
    return new UserEntityRepo({
      _id: user._id,
      authConfirmation: user.authConfirmation,
      email: user.email,
      login: user.login,
      passConfirmation: user.passConfirmation,
      password: user.password,
      createdAt: user.createdAt,
      isAuthExpired(): boolean {
        return user.isAuthExpired();
      },
      isPassConfirmed(): boolean {
        return user.isPassConfirmed();
      },
      isPassExpired(): boolean {
        return user.isPassExpired();
      },
      isAuthConfirmed(): boolean {
        return user.isAuthConfirmed();
      },
      setAuthConfirmation(conf: UserConfirmation): void {
        user.setAuthConfirmation(conf);
      },
      setAuthConfirmed(confirm: boolean): void {
        user.setAuthConfirmed(confirm);
      },
      setPassConfirmation(conf: UserConfirmation): void {
        user.setPassConfirmation(conf);
      },
      setPassConfirmed(confirm: boolean): void {
        user.setPassConfirmed(confirm);
      },
      setPassword(password: UserEncodedPassword) {
        user.setPassword(password);
      },
      save(): Promise<void> {
        return user.applyCommands();
      },
    });
  }
  static createMongoEntity(user: UserDocumentType, onSave: () => Promise<void>): UserEntityRepo {
    return new UserEntityRepo({
      _id: user._id.toString(),
      authConfirmation: user.authConfirmation,
      email: user.email,
      login: user.login,
      passConfirmation: user.passConfirmation,
      password: user.password,
      createdAt: user.createdAt,
      isAuthExpired(): boolean {
        return user.isAuthExpired();
      },
      isPassConfirmed(): boolean {
        return user.isPassConfirmed();
      },
      isPassExpired(): boolean {
        return user.isPassExpired();
      },
      isAuthConfirmed(): boolean {
        return user.isAuthConfirmed();
      },
      setAuthConfirmation(conf: UserConfirmation): void {
        user.setAuthConfirmation(conf);
      },
      setAuthConfirmed(confirm: boolean): void {
        user.setAuthConfirmed(confirm);
      },
      setPassConfirmation(conf: UserConfirmation): void {
        user.setPassConfirmation(conf);
      },
      setPassConfirmed(confirm: boolean): void {
        user.setPassConfirmed(confirm);
      },
      setPassword(password: UserEncodedPassword) {
        user.setPassword(password);
      },
      save(): Promise<void> {
        return onSave();
      },
    });
  }
}
