import { IUser, IUserMethods, UserConfirmation, UserEncodedPassword } from '../../types/dao';
import { DataSource } from 'typeorm';
import { WithDbId } from '../../../../application/utils/types';
import { EntityRepoResult } from '../../../entity.repo.result';

export class UserSqlRawResult extends EntityRepoResult implements IUser, IUserMethods {
  _id: string;
  login: string;
  email: string;
  password: UserEncodedPassword;
  authConfirmation: UserConfirmation;
  passConfirmation: UserConfirmation;
  createdAt: Date;

  constructor(
    private readonly dataSource: DataSource,
    private readonly user: WithDbId<IUser>,
  ) {
    super();
    this._id = user._id;
    this.login = user.login;
    this.email = user.email;
    this.password = user.password;
    this.authConfirmation = user.authConfirmation;
    this.passConfirmation = user.passConfirmation;
    this.createdAt = user.createdAt;
  }

  setAuthConfirmed(confirm: boolean): void {
    this.addCommand(async () => {
      await this.dataSource.query(
        `UPDATE public."UsersRegistrationConfirmation" as u
                                   SET "confirmed" = $2
                                   WHERE u."userId" = $1`,
        [this._id, confirm],
      );
      this.authConfirmation.confirmed = confirm;
    });
  }

  setPassConfirmed(confirm: boolean): void {
    this.addCommand(async () => {
      await this.dataSource.query(
        `UPDATE public."UsersRecoveryConfirmation" as u
                                   SET "confirmed" = $2
                                   WHERE u."userId" = $1`,
        [this._id, confirm],
      );
      this.passConfirmation.confirmed = confirm;
    });
  }

  setAuthConfirmation(conf: UserConfirmation): void {
    this.addCommand(async () => {
      await this.dataSource.query(
        `INSERT INTO public."UsersRegistrationConfirmation" ("userId", "code", "confirmed", "expiredIn")
                                   VALUES ($1, $2, $3, $4) ON CONFLICT ("userId") DO UPDATE SET "code"= $2, "confirmed" = $3, "expiredIn" = $4 `,
        [this._id, conf.code, conf.confirmed, conf.expiredIn],
      );
      this.authConfirmation.confirmed = conf.confirmed;
      this.authConfirmation.code = conf.code;
      this.authConfirmation.expiredIn = conf.expiredIn;
    });
  }

  setPassConfirmation(conf: UserConfirmation): void {
    this.addCommand(async () => {
      await this.dataSource.query(
        `INSERT INTO public."UsersRecoveryConfirmation" ("userId", "code", "confirmed", "expiredIn")
                                   VALUES ($1, $2, $3, $4)`,
        [this._id, conf.code, conf.confirmed, conf.expiredIn],
      );
      this.passConfirmation.confirmed = conf.confirmed;
      this.passConfirmation.code = conf.code;
      this.passConfirmation.expiredIn = conf.expiredIn;
    });
  }

  setPassword(password: UserEncodedPassword): void {
    this.addCommand(async () => {
      await this.dataSource.query(`UPDATE public."UsersCredentials" as uc SET "hash"=$2, "salt"=$3 WHERE uc."userId" = $1`, [
        this._id,
        password.hash,
        password.salt,
      ]);
      this.password.hash = password.hash;
      this.password.salt = password.salt;
    });
  }

  isAuthConfirmed(): boolean {
    return this.authConfirmation.confirmed;
  }

  isPassConfirmed(): boolean {
    return this.passConfirmation.confirmed;
  }

  isAuthExpired(): boolean {
    return new Date().getTime() > new Date(this.authConfirmation.expiredIn).getTime();
  }

  isPassExpired(): boolean {
    return new Date().getTime() > new Date(this.passConfirmation.expiredIn).getTime();
  }
}
