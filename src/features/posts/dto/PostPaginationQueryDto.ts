import { SORTING_PAGE_DEFAULT, SORTING_SIZE_DEFAULT, SortingEnum } from '../../common.query.dto';
import { SortingDirection, WithPaginationQuery } from '../../../application/utils/types';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

enum PostQueryEnum {
  createdAt = 'createdAt',
  title = 'title',
  shortDescription = 'shortDescription',
  content = 'content',
  blogName = 'blogName',
}

export class PostPaginationQueryDto implements WithPaginationQuery {
  @IsOptional()
  @IsEnum(PostQueryEnum)
  sortBy: string = PostQueryEnum.createdAt;

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
}
