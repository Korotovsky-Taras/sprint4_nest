import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { QuizPaginationQueryDto, QuizQueryStatusEnum } from '../../dto/QuizPaginationQueryDto';
import { WithPagination } from '../../../../application/utils/types';
import { QuizGameQuestionViewModel } from '../../types/dto';
import { QuizGameQuestionRawType } from '../../types/dao';
import { withSqlOrmPagination } from '../../../../application/utils/withSqlOrmPagination';
import { QuizGameQuestionsEntity } from './entities/quiz-game-questions.entity';
import { QuizGameSqlOrmDataMapper } from './quiz-game.sql-orm.dm';
import { IQuizGameQueryRepository } from '../../types/common';

@Injectable()
export class QuizGameSqlOrmQueryRepository implements IQuizGameQueryRepository {
  constructor(
    @InjectRepository(QuizGameQuestionsEntity) private gameQuestionsRepo: Repository<QuizGameQuestionsEntity>,
    @InjectEntityManager() private manager: EntityManager,
  ) {}

  getAllQuestions(query: QuizPaginationQueryDto): Promise<WithPagination<QuizGameQuestionViewModel>> {
    const qb = this.manager.createQueryBuilder();

    let publishedInCondition = [true, false];
    if (query.publishedStatus === QuizQueryStatusEnum.notPublished) {
      publishedInCondition = [false];
    } else if (query.publishedStatus === QuizQueryStatusEnum.published) {
      publishedInCondition = [true];
    }
    const searchByTerm = query.bodySearchTerm ? query.bodySearchTerm : '';

    const queryBuilder = qb.select('res.*').from((subQuery) => {
      return subQuery
        .select('q.*')
        .from(QuizGameQuestionsEntity, 'q')
        .where(`q.body ILIKE :term`, { term: `%${searchByTerm}%` })
        .andWhere(`q.published IN (${publishedInCondition.join(', ')})`);
    }, 'res');

    const sortByWithCollate = query.sortBy !== 'createdAt' ? 'COLLATE "C"' : '';

    return withSqlOrmPagination<QuizGameQuestionRawType, QuizGameQuestionViewModel>(queryBuilder, query, sortByWithCollate, (users) => {
      return QuizGameSqlOrmDataMapper.toQuestionsView(users);
    });
  }

  async getQuestionById(quizQuestionId: string): Promise<QuizGameQuestionViewModel | null> {
    const queryBuilder = this.gameQuestionsRepo.createQueryBuilder('q');

    const res = await queryBuilder
      .select('q.*')
      .where(`q."_id" = :id `, { id: Number(quizQuestionId) })
      .getRawOne<QuizGameQuestionRawType>();

    if (res) {
      return QuizGameSqlOrmDataMapper.toQuestionView(res);
    }

    return null;
  }
}
