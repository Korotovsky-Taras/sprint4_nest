import { IsEnum, IsNumber, IsOptional, IsString } from 'class-validator';
import { SORTING_PAGE_DEFAULT, SORTING_SIZE_DEFAULT, SortingEnum } from '../../common.query.dto';
import { SortingDirection, WithPaginationQuery } from '../../../application/utils/types';
import { Type } from 'class-transformer';

enum QuizQuerySortEnum {
  createdAt = 'createdAt',
}

enum QuizQueryStatusEnum {
  all = 'all',
  published = 'published',
  notPublished = 'notPublished',
}

export class QuizPaginationQueryDto implements WithPaginationQuery {
  @IsOptional()
  @IsEnum(QuizQuerySortEnum)
  sortBy: string = QuizQuerySortEnum.createdAt;

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
  @IsEnum(QuizQueryStatusEnum)
  publishedStatus: string = QuizQueryStatusEnum.all;

  @IsOptional()
  @IsString()
  bodySearchTerm: string | null = null;
}
