import { Injectable } from '@nestjs/common';
import { IUsersQueryRepository } from '../../types/common';
import { IUser, UserConfirmation, UserMongoType } from '../../types/dao';
import { UserConfirmationCodeValidateResult, UserMeViewModel, UserViewModel } from '../../types/dto';
import { WithDbId, WithPagination } from '../../../../application/utils/types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { UserPaginationQueryDto } from '../../dto/UserPaginationQueryDto';
import { withSqlRawPagination } from '../../../../application/utils/withSqlRawPagination';
import { UsersSqlRawDataMapper } from './users.sql-raw.dm';

@Injectable()
export class UsersSqlRawQueryRepository implements IUsersQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getUsers(query: UserPaginationQueryDto): Promise<WithPagination<UserViewModel>> {
    const searchByLoginTerm = query.searchLoginTerm ? query.searchLoginTerm : '';
    const searchByEmailTerm = query.searchEmailTerm ? query.searchEmailTerm : '';

    const sortByWithCollate = query.sortBy !== 'createdAt' ? 'COLLATE "C"' : '';

    const sql = `SELECT *, CAST(count(*) OVER() as INTEGER) as "totalCount" 
                 FROM public."Users" as u WHERE u."login" ILIKE $3 OR u."email" ILIKE $4 
                 ORDER BY "${query.sortBy}" ${sortByWithCollate} ${query.sortDirection} LIMIT $1 OFFSET $2`;

    return withSqlRawPagination<WithDbId<IUser>, UserViewModel>(this.dataSource, sql, [`%${searchByLoginTerm}%`, `%${searchByEmailTerm}%`], query, (users) => {
      return UsersSqlRawDataMapper.toUsersView(users);
    });
  }

  async getUserById(userId: string): Promise<UserMeViewModel | null> {
    const res = await this.dataSource.query<UserMongoType[]>(`SELECT * FROM public."Users" as u WHERE u."_id" = $1`, [userId]);
    if (res.length > 0) {
      return UsersSqlRawDataMapper.toMeView(res[0]);
    }
    return null;
  }

  async isUserExistByLoginOrEmail(login: string, email: string): Promise<boolean> {
    const res = await this.dataSource.query<UserMongoType[]>(`SELECT * FROM public."Users" as u WHERE u."email" = $1 OR u."login" = $2`, [email, login]);
    return res.length > 0;
  }

  async getUserByLoginOrEmail(login: string, email: string): Promise<UserViewModel | null> {
    const res = await this.dataSource.query<UserMongoType[]>(`SELECT * FROM public."Users" as u WHERE u."email" = $1 OR u."login" = $2`, [email, login]);
    if (res.length > 0) {
      return UsersSqlRawDataMapper.toUserView(res[0]);
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
