import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { IQuizGameQueryRepository } from '../../types/common';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { withSqlRawPagination } from '../../../../application/utils/withSqlRawPagination';
import { QuizPaginationQueryDto, QuizQueryStatusEnum } from '../../dto/QuizPaginationQueryDto';
import { WithPagination } from '../../../../application/utils/types';
import { QuizGameQuestionViewModel } from '../../types/dto';
import { QuizGameQuestionRawType } from '../../types/dao';
import { QuizGameSqlRawDataMapper } from './quiz-game.sql-raw.dm';

@Injectable()
export class QuizGameSqlRawQueryRepository implements IQuizGameQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  getAllQuestions(query: QuizPaginationQueryDto): Promise<WithPagination<QuizGameQuestionViewModel>> {
    let publishedInCondition = [true, false];
    if (query.publishedStatus === QuizQueryStatusEnum.notPublished) {
      publishedInCondition = [false];
    } else if (query.publishedStatus === QuizQueryStatusEnum.published) {
      publishedInCondition = [true];
    }

    const searchByTerm = query.bodySearchTerm ? query.bodySearchTerm : '';
    const sortByWithCollate = query.sortBy !== 'createdAt' ? 'COLLATE "C"' : '';

    return withSqlRawPagination<QuizGameQuestionRawType, QuizGameQuestionViewModel>(
      this.dataSource,
      `SELECT *, CAST(count(*) OVER() as INTEGER) as "totalCount"
           FROM public."QuizGamesQuestions" as t WHERE t."body" ILIKE $3 AND t."published" IN (${publishedInCondition.join(', ')})
           ORDER BY "${query.sortBy}" ${sortByWithCollate} ${query.sortDirection} 
           LIMIT $1 OFFSET $2`,
      [`%${searchByTerm}%`],
      query,
      (items) => {
        return QuizGameSqlRawDataMapper.toQuestionsView(items);
      },
    );
  }

  async getQuestionById(quizQuestionId: string): Promise<QuizGameQuestionViewModel | null> {
    const res = await this.dataSource.query<QuizGameQuestionRawType[]>(
      `SELECT g.* FROM public."QuizGamesQuestions" as g
       WHERE g."_id" = $1`,
      [Number(quizQuestionId)],
    );

    if (res.length > 0) {
      return QuizGameSqlRawDataMapper.toQuestionView(res[0]);
    }

    return null;
  }
}
