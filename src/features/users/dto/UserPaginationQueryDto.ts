import { SORTING_PAGE_DEFAULT, SORTING_SIZE_DEFAULT, SortingEnum } from '../../common.query.dto';
import { SortingDirection, WithPaginationQuery } from '../../../application/utils/types';
import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';

enum UserQueryEnum {
  createdAt = 'createdAt',
  login = 'login',
  email = 'email',
}

export class UserPaginationQueryDto implements WithPaginationQuery {
  @IsOptional()
  @IsEnum(UserQueryEnum)
  sortBy: string = UserQueryEnum.createdAt;

  @IsOptional()
  @IsEnum(SortingEnum)
  sortDirection: SortingDirection = SortingEnum.desc;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageNumber: number = SORTING_PAGE_DEFAULT;

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  pageSize: number = SORTING_SIZE_DEFAULT;

  @IsOptional()
  @IsString()
  searchLoginTerm: string | null = null;

  @IsOptional()
  @IsString()
  searchEmailTerm: string | null = null;
}
