import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { IQuizGameQueryRepository } from '../../types/common';
import { WithPagination } from '../../../../application/utils/types';
import { FilterQuery, isValidObjectId } from 'mongoose';
import { withMongoPagination } from '../../../../application/utils/withMongoPagination';
import { QuizGameQuestionViewModel } from '../../types/dto';
import { QuizPaginationQueryDto } from '../../dto/QuizPaginationQueryDto';
import { IQuizGameModel, IQuizGameQuestion, IQuizGameQuestionsModel, QuizGameQuestionDBType } from '../../types/dao';
import { InjectModel } from '@nestjs/mongoose';
import { QuizGameQuestion } from './quiz-game-question.mongo.schema';
import { QuizGameMongoDataMapper } from './quiz-game.mongo.dm';
import { QuizGame } from './quiz-game.mongo.schema';

@Injectable()
export class QuizGameMongoQueryRepository implements IQuizGameQueryRepository {
  constructor(
    @InjectModel(QuizGame.name) private quizGameModel: IQuizGameModel,
    @InjectModel(QuizGameQuestion.name) private quizGameQuestionsModel: IQuizGameQuestionsModel,
  ) {}

  async getQuestionById(questionId: string): Promise<QuizGameQuestionViewModel | null> {
    if (!isValidObjectId(questionId)) {
      return null;
    }
    const question: QuizGameQuestionDBType | null = await this.quizGameQuestionsModel.findById(questionId).lean();

    if (question) {
      return QuizGameMongoDataMapper.toQuestionView(question);
    }
    return null;
  }

  async getAllQuestions(query: QuizPaginationQueryDto): Promise<WithPagination<QuizGameQuestionViewModel>> {
    const filter: FilterQuery<IQuizGameQuestion> = {};
    if (query.bodySearchTerm != null) {
      filter.body = { $regex: query.bodySearchTerm, $options: 'i' };
    }
    return withMongoPagination<QuizGameQuestionDBType, QuizGameQuestionViewModel>(this.quizGameQuestionsModel, filter, query, (items) => {
      return QuizGameMongoDataMapper.toQuestionsView(items);
    });
  }
}
