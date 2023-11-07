import { Injectable } from '@nestjs/common';
import { IUsersQueryRepository, UserListMapperType, UserMapperType } from '../../types/common';
import { UserConfirmation, UserMongoType } from '../../types/dao';
import { UserConfirmationCodeValidateResult } from '../../types/dto';
import { WithPagination } from '../../../../application/utils/types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserPaginationQueryDto } from '../../dto/UserPaginationQueryDto';
import { withSqlPagination } from '../../../../application/utils/withSqlPagination';

@Injectable()
export class UsersSqlRawQueryRepository implements IUsersQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getUsers<T>(query: UserPaginationQueryDto, mapper: UserListMapperType<T>): Promise<WithPagination<T>> {
    const searchByLoginTerm = query.searchLoginTerm ? query.searchLoginTerm : '';
    const searchByEmailTerm = query.searchEmailTerm ? query.searchEmailTerm : '';

    const sql = `SELECT *, CAST(count(*) OVER() as INTEGER) as "totalCount" FROM public."Users" as u WHERE u."login" ILIKE $3 OR u."email" ILIKE $4 ORDER BY "${query.sortBy}" ${query.sortDirection} LIMIT $1 OFFSET $2`;

    return withSqlPagination(this.dataSource, sql, [`%${searchByLoginTerm}%`, `%${searchByEmailTerm}%`], query, mapper);
  }

  async getUserById<T>(userId: string, mapper: UserMapperType<T>): Promise<T | null> {
    const res = await this.dataSource.query<UserMongoType[]>(`SELECT * FROM public."Users" as u WHERE u."_id" = $1`, [userId]);
    if (res.length > 0) {
      return mapper(res[0]);
    }
    return null;
  }

  async isUserExistByLoginOrEmail(login: string, email: string): Promise<boolean> {
    const res = await this.dataSource.query<UserMongoType[]>(`SELECT * FROM public."Users" as u WHERE u."email" = $1 OR u."login" = $2`, [email, login]);
    return res.length > 0;
  }

  async getUserByLoginOrEmail<T>(login: string, email: string, mapper: UserMapperType<T>): Promise<T | null> {
    const res = await this.dataSource.query<UserMongoType[]>(`SELECT * FROM public."Users" as u WHERE u."email" = $1 OR u."login" = $2`, [email, login]);
    if (res.length > 0) {
      return mapper(res[0]);
    }
    return null;
  }

  async getAuthConfirmationValidation(code: string): Promise<UserConfirmationCodeValidateResult | null> {
    const res = await this.dataSource.query<UserConfirmation[]>(
      `SELECT uc."confirmed", uc."expiredIn" FROM public."UsersRegistrationConfirmation" as uc WHERE uc."code" = $1`,
      [code],
    );
    if (res.length > 0) {
      return {
        isConfirmed: res[0].confirmed,
        isExpired: new Date().getTime() > new Date(res[0].expiredIn).getTime(),
      };
    }
    return null;
  }

  async getPassConfirmationValidation(code: string): Promise<UserConfirmationCodeValidateResult | null> {
    const res = await this.dataSource.query<UserConfirmation[]>(
      `SELECT uc."confirmed", uc."expiredIn" FROM public."UsersRecoveryConfirmation" as uc WHERE uc."code" = $1`,
      [code],
    );
    if (res.length > 0) {
      return {
        isConfirmed: res[0].confirmed,
        isExpired: new Date().getTime() > new Date(res[0].expiredIn).getTime(),
      };
    }
    return null;
  }

  async getUserRegistrationConfirmationByEmail(email: string): Promise<UserConfirmation | null> {
    const res = await this.dataSource.query<{ authConfirmation: UserConfirmation }[]>(
      `SELECT (SELECT row_to_json(row) as "authConfirmation" FROM (SELECT "code","confirmed","expiredIn" FROM public."UsersRegistrationConfirmation" as uc WHERE uc."userId" = u."_id") as row) FROM public."Users" as u WHERE u."email" = $1`,
      [email],
    );
    if (res.length > 0) {
      return res[0].authConfirmation;
    }
    return null;
  }
}
