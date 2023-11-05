import { Injectable } from '@nestjs/common';
import { IUsersRepository } from '../../types/common';
import { IUser, UserConfirmation } from '../../types/dao';
import { UserCreateInputModel } from '../../types/dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserSqlRawResult } from './users.sql-raw.result';
import { WithDbId } from '../../../../application/utils/types';
import { UserEntityRepo } from '../user-entity.repo';
import { UserEntityFactory } from '../user-entity.factory';

@Injectable()
export class UsersSqlRawRepository implements IUsersRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async isUserAuthConfirmed(userId: string): Promise<boolean> {
    const res = await this.dataSource.query<{ authConfirmation: UserConfirmation }[]>(
      `SELECT (SELECT row_to_json(row) as "authConfirmation" FROM (SELECT "code","confirmed","expiredIn" FROM public."UsersRegistrationConfirmation" as uc WHERE uc."userId" = u."_id") as row) FROM public."Users" as u WHERE u."_id" = $1`,
      [userId],
    );
    return res.length > 0 && res[0].authConfirmation.confirmed;
  }

  async deleteUserById(userId: string): Promise<boolean> {
    const [, count] = await this.dataSource.query(`DELETE FROM public."Users" as u WHERE u."_id" = $1`, [userId]);
    return count > 0;
  }

  async createUser(model: UserCreateInputModel): Promise<UserEntityRepo> {
    const res = await this.dataSource.query<WithDbId<IUser>[]>(
      `WITH newUser AS (
          INSERT INTO public."Users" ("login", "email")
              VALUES ($1, $2)
              RETURNING *
      ), userCredentials AS (
          INSERT INTO public."UsersCredentials" ("salt", "hash", "userId")
              VALUES ($3, $4, (SELECT "_id" FROM newUser))
              RETURNING "hash", "salt"
      ), userConfirmation AS (
          INSERT INTO public."UsersRegistrationConfirmation" ("code", "expiredIn", "confirmed", "userId")
              VALUES ($5, $6, $7, (SELECT "_id" FROM newUser))
              RETURNING "code", "confirmed", "expiredIn"
      ) SELECT *,
               (SELECT row_to_json(row) as "passConfirmation" FROM userCredentials as row),
               (SELECT row_to_json(row) as "authConfirmation" FROM userConfirmation as row)
        FROM newUser`,
      [
        model.login,
        model.email,
        model.password.salt,
        model.password.hash,
        model.authConfirmation.code,
        model.authConfirmation.expiredIn,
        model.authConfirmation.confirmed,
      ],
    );
    return UserEntityFactory.createSqlRawEntity(new UserSqlRawResult(this.dataSource, res[0]));
  }

  async getUserByAuthConfirmationCode(code: string): Promise<UserEntityRepo | null> {
    const res = await this.dataSource.query<WithDbId<IUser>[]>(
      `SELECT u."_id", u."login", u."email", u."createdAt",
       (SELECT row_to_json(row) as "password" FROM (SELECT "hash", "salt" FROM public."UsersCredentials" as up WHERE up."userId" = uc."userId") as row),
       (SELECT row_to_json(row) as "authConfirmation" FROM (SELECT "code", "confirmed", "expiredIn" FROM public."UsersRegistrationConfirmation" as ur WHERE ur."userId" = uc."userId") as row),
       (SELECT row_to_json(row) as "passConfirmation" FROM (SELECT "code", "confirmed", "expiredIn" FROM public."UsersRecoveryConfirmation" as ur WHERE ur."userId" = uc."userId") as row)
       FROM public."UsersRegistrationConfirmation" as uc LEFT JOIN public."Users" as u on u."_id" = uc."userId" WHERE uc."code" = $1`,
      [code],
    );
    if (res.length > 0) {
      return UserEntityFactory.createSqlRawEntity(new UserSqlRawResult(this.dataSource, res[0]));
    }
    return null;
  }

  async getUserByPassConfirmationCode(code: string): Promise<UserEntityRepo | null> {
    const res = await this.dataSource.query<WithDbId<IUser>[]>(
      `SELECT u."_id", u."login", u."email", u."createdAt",
       (SELECT row_to_json(row) as "password" FROM (SELECT "hash", "salt" FROM public."UsersCredentials" as up WHERE up."userId" = uc."userId") as row),
       (SELECT row_to_json(row) as "authConfirmation" FROM (SELECT "code", "confirmed", "expiredIn" FROM public."UsersRegistrationConfirmation" as ur WHERE ur."userId" = uc."userId") as row),
       (SELECT row_to_json(row) as "passConfirmation" FROM (SELECT "code", "confirmed", "expiredIn" FROM public."UsersRecoveryConfirmation" as ur WHERE ur."userId" = uc."userId") as row)
       FROM public."UsersRecoveryConfirmation" as uc LEFT JOIN public."Users" as U on U."_id" = uc."userId" WHERE uc."code" = $1`,
      [code],
    );
    if (res.length > 0) {
      return UserEntityFactory.createSqlRawEntity(new UserSqlRawResult(this.dataSource, res[0]));
    }
    return null;
  }

  async getUserById(userId: string): Promise<UserEntityRepo | null> {
    const res = await this.dataSource.query<WithDbId<IUser>[]>(
      `SELECT u."_id", u."login", u."email", u."createdAt",
       (SELECT row_to_json(row) as "password" FROM (SELECT "hash", "salt" FROM public."UsersCredentials" as up WHERE up."userId" = u."_id") as row),
       (SELECT row_to_json(row) as "authConfirmation" FROM (SELECT "code", "confirmed", "expiredIn" FROM public."UsersRegistrationConfirmation" as ur WHERE ur."userId" = u."_id") as row),
       (SELECT row_to_json(row) as "passConfirmation" FROM (SELECT "code", "confirmed", "expiredIn" FROM public."UsersRecoveryConfirmation" as ur WHERE ur."userId" = u."_id") as row)
       FROM public."Users" as u WHERE u."_id" = $1`,
      [userId],
    );
    if (res.length > 0) {
      return UserEntityFactory.createSqlRawEntity(new UserSqlRawResult(this.dataSource, res[0]));
    }
    return null;
  }

  async isUserExist(userId: string): Promise<boolean> {
    const res = await this.dataSource.query(`SELECT u."_id" FROM public."Users" as u WHERE u."_id" = $1`, [userId]);
    return res.length > 0;
  }

  async getUserByLoginOrEmail(login: string, email: string): Promise<UserEntityRepo | null> {
    const res = await this.dataSource.query<WithDbId<IUser>[]>(
      `SELECT u."_id", u."login", u."email", u."createdAt",
       (SELECT row_to_json(row) as "password" FROM (SELECT "hash", "salt" FROM public."UsersCredentials" as up WHERE up."userId" = u."_id") as row),
       (SELECT row_to_json(row) as "authConfirmation" FROM (SELECT "code", "confirmed", "expiredIn" FROM public."UsersRegistrationConfirmation" as ur WHERE ur."userId" = u."_id") as row),
       (SELECT row_to_json(row) as "passConfirmation" FROM (SELECT "code", "confirmed", "expiredIn" FROM public."UsersRecoveryConfirmation" as ur WHERE ur."userId" = u."_id") as row)
       FROM public."Users" as u WHERE u."login" = $1 OR u."email" = $2`,
      [login, email],
    );
    if (res.length > 0) {
      return UserEntityFactory.createSqlRawEntity(new UserSqlRawResult(this.dataSource, res[0]));
    }
    return null;
  }

  async getUserByEmail(email: string): Promise<UserEntityRepo | null> {
    const res = await this.dataSource.query<WithDbId<IUser>[]>(
      `SELECT u."_id", u."login", u."email", u."createdAt",
       (SELECT row_to_json(row) as "password" FROM (SELECT "hash", "salt" FROM public."UsersCredentials" as up WHERE up."userId" = u."_id") as row),
       (SELECT row_to_json(row) as "authConfirmation" FROM (SELECT "code", "confirmed", "expiredIn" FROM public."UsersRegistrationConfirmation" as ur WHERE ur."userId" = u."_id") as row),
       (SELECT row_to_json(row) as "passConfirmation" FROM (SELECT "code", "confirmed", "expiredIn" FROM public."UsersRecoveryConfirmation" as ur WHERE ur."userId" = u."_id") as row)
       FROM public."Users" as u WHERE u."email" = $1`,
      [email],
    );
    if (res.length > 0) {
      return UserEntityFactory.createSqlRawEntity(new UserSqlRawResult(this.dataSource, res[0]));
    }
    return null;
  }

  async saveDoc(): Promise<void> {}

  async clear(): Promise<void> {
    await this.dataSource.query(`TRUNCATE TABLE public."Users" CASCADE`);
  }
}
