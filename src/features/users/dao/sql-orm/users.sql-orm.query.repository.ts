import { Injectable } from '@nestjs/common';
import { IUsersQueryRepository } from '../../types/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserPaginationQueryDto } from '../../dto/UserPaginationQueryDto';
import { WithPagination } from '../../../../application/utils/types';
import { UserConfirmation } from '../../types/dao';
import { UserConfirmationCodeValidateResult, UserMeViewModel, UserViewModel } from '../../types/dto';
import { UsersEntity } from './entities/users.entity';
import { UsersSqlOrmDataMapper } from './users.sql-orm.dm';
import { withSqlOrmPagination } from '../../../../application/utils/withSqlOrmPagination';

@Injectable()
export class UsersSqlOrmQueryRepository implements IUsersQueryRepository {
  constructor(@InjectRepository(UsersEntity) private userRepo: Repository<UsersEntity>) {}

  async getUsers(query: UserPaginationQueryDto): Promise<WithPagination<UserViewModel>> {
    const searchByLoginTerm = query.searchLoginTerm ?? '';
    const searchByEmailTerm = query.searchEmailTerm ?? '';

    const queryBuilder = this.userRepo
      .createQueryBuilder('u')
      .where(`u.login ILIKE :login OR u.email ILIKE :email`, { login: `%${searchByLoginTerm}%`, email: `%${searchByEmailTerm}%` });

    const sortByWithCollate = query.sortBy !== 'createdAt' ? 'COLLATE "C"' : '';

    return withSqlOrmPagination<UsersEntity, UserViewModel>(queryBuilder, query, sortByWithCollate, (users) => {
      return UsersSqlOrmDataMapper.toUsersView(users);
    });
  }

  async getUserById(userId: string): Promise<UserMeViewModel | null> {
    const user: UsersEntity | null = await this.userRepo.findOne({
      where: { _id: Number(userId) },
    });
    if (user) {
      return UsersSqlOrmDataMapper.toMeView(user);
    }
    return null;
  }

  async isUserExistByLoginOrEmail(login: string, email: string): Promise<boolean> {
    const user: UsersEntity | null = await this.userRepo.findOne({ where: [{ email }, { login }] });
    return user !== null;
  }

  async getAuthConfirmationValidation(code: string): Promise<UserConfirmationCodeValidateResult | null> {
    const user: UsersEntity | null = await this.userRepo.findOne({
      where: { authConfirmation: { code } },
      relations: { authConfirmation: true },
    });
    if (user !== null) {
      return {
        isConfirmed: user.isAuthConfirmed(),
        isExpired: user.isAuthExpired(),
      };
    }
    return null;
  }

  async getPassConfirmationValidation(code: string): Promise<UserConfirmationCodeValidateResult | null> {
    const user: UsersEntity | null = await this.userRepo.findOne({
      where: { passConfirmation: { code } },
      relations: { passConfirmation: true },
    });
    if (user !== null) {
      return {
        isConfirmed: user.isPassConfirmed(),
        isExpired: user.isPassExpired(),
      };
    }
    return null;
  }

  async getUserRegistrationConfirmationByEmail(email: string): Promise<UserConfirmation | null> {
    const user: UsersEntity | null = await this.userRepo.findOne({
      where: { email },
      relations: { authConfirmation: true },
    });
    if (user !== null) {
      return user.authConfirmation;
    }
    return null;
  }
}
