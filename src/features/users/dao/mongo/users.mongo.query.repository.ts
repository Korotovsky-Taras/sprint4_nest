import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { IUsersQueryRepository, UserListMapperType, UserMapperType } from '../../types/common';
import { IUserModel, UserConfirmation, UserDocumentType, UserMongoType } from '../../types/dao';
import { User } from './users.schema';
import { UserConfirmationCodeValidateResult } from '../../types/dto';
import { FilterQuery } from 'mongoose';
import { WithPagination } from '../../../../application/utils/types';
import { withMongoPagination } from '../../../../application/utils/withMongoPagination';
import { UserPaginationQueryDto } from '../../dto/UserPaginationQueryDto';

@Injectable()
export class UsersMongoQueryRepository implements IUsersQueryRepository {
  constructor(@InjectModel(User.name) private userModel: IUserModel) {}

  async getUsers<T>(query: UserPaginationQueryDto, mapper: UserListMapperType<T>): Promise<WithPagination<T>> {
    let filter: FilterQuery<UserMongoType> = {};

    const searchLoginTermFilter: FilterQuery<UserMongoType> | null =
      query.searchLoginTerm !== null
        ? {
            login: {
              $regex: query.searchLoginTerm,
              $options: 'i',
            },
          }
        : null;
    const searchEmailTermFilter: FilterQuery<UserMongoType> | null =
      query.searchEmailTerm !== null
        ? {
            email: {
              $regex: query.searchEmailTerm,
              $options: 'i',
            },
          }
        : null;

    if (searchLoginTermFilter && searchEmailTermFilter) {
      filter = { $or: [searchEmailTermFilter, searchLoginTermFilter] };
    } else if (searchLoginTermFilter) {
      filter = searchLoginTermFilter;
    } else if (searchEmailTermFilter) {
      filter = searchEmailTermFilter;
    }

    return withMongoPagination<UserMongoType, T>(this.userModel, filter, query, mapper);
  }

  async getUserById<T>(userId: string, mapper: UserMapperType<T>): Promise<T | null> {
    const user: UserMongoType | null = await this.userModel.findById(userId).lean();
    if (user) {
      return mapper(user);
    }
    return null;
  }

  async isUserExistByLoginOrEmail(login: string, email: string): Promise<boolean> {
    const user: UserMongoType | null = await this.userModel.findOne().or([{ email }, { login }]).lean();
    return !!user;
  }

  async getUserByLoginOrEmail<T>(login: string, email: string, mapper: UserMapperType<T>): Promise<T | null> {
    const user: UserMongoType | null = await this.userModel.findOne().or([{ email }, { login }]).lean();
    if (user) {
      return mapper(user);
    }
    return null;
  }

  async getAuthConfirmationValidation(code: string): Promise<UserConfirmationCodeValidateResult | null> {
    const user: UserDocumentType | null = await this.userModel
      .findOne({
        'authConfirmation.code': code,
      })
      .exec();

    if (user) {
      return {
        isConfirmed: user.isAuthConfirmed(),
        isExpired: user.isAuthExpired(),
      };
    }
    return null;
  }

  async getPassConfirmationValidation(code: string): Promise<UserConfirmationCodeValidateResult | null> {
    const user: UserDocumentType | null = await this.userModel
      .findOne({
        'passConfirmation.code': code,
      })
      .exec();

    if (user) {
      return {
        isConfirmed: user.isPassConfirmed(),
        isExpired: user.isPassExpired(),
      };
    }
    return null;
  }

  async getUserRegistrationConfirmationByEmail(email: string): Promise<UserConfirmation | null> {
    const user = await this.userModel.findOne({ email }).exec();
    if (user) {
      return user.authConfirmation;
    }
    return null;
  }
}
