import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { SORTING_PAGE_DEFAULT, SORTING_SIZE_DEFAULT, SortingEnum } from '../../common.query.dto';
import { SortingDirection, WithPaginationQuery } from '../../../application/utils/types';
import { Type } from 'class-transformer';

enum BlogsQueryEnum {
  createdAt = 'createdAt',
  name = 'name',
  description = 'description',
  websiteUrl = 'websiteUrl',
}

export class BlogPaginationQueryDto implements WithPaginationQuery {
  @IsOptional()
  @IsEnum(BlogsQueryEnum)
  sortBy: string = BlogsQueryEnum.createdAt;

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
  searchNameTerm: string;
}
