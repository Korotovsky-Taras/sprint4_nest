import { IRepository, IService } from '../../types';
import { WithPagination } from '../../../application/utils/types';
import {
  QuizGameAnswerViewModel,
  QuizGameQuestionCreateModel,
  QuizGameQuestionPublishUpdateModel,
  QuizGameQuestionUpdateModel,
  QuizGameQuestionViewModel,
  QuizGameViewModel,
} from './dto';
import { QuizQuestionCreateDto } from '../dto/QuizQuestionCreateDto';
import { QuizPaginationQueryDto } from '../dto/QuizPaginationQueryDto';
import { QuizAnswerDto } from '../dto/QuizAnswerDto';
import { QuizGamePlayerProgressDBType } from './dao';

export interface IQuizGameService extends IService {}

export interface IQuizGameController {
  getGame(gameId: string, userId: string);
  getMyCurrentGame(userId: string);
  sendAnswer(userId: string, dto: QuizAnswerDto);
  createConnection(userId: string);
}

export interface IQuizGameSaController {
  getAllQuestions(dto: QuizPaginationQueryDto): Promise<WithPagination<QuizGameQuestionViewModel>>;
  getQuestion(quizQuestionId: string): Promise<QuizGameQuestionViewModel>;
  createQuestion(dto: QuizQuestionCreateDto);
}

export const QuizGameRepoKey = Symbol('QUIZ_GAME_REPO');

export interface IQuizGameRepository<T> extends IRepository<T> {
  createQuestion(model: QuizGameQuestionCreateModel): Promise<QuizGameQuestionViewModel>;
  deleteQuestionById(quizQuestionId: string): Promise<boolean>;
  isQuestionExist(quizQuestionId: string): Promise<boolean>;
  isUserInActiveGame(quizQuestionId: string): Promise<boolean>;
  isUserFinishInActiveGame(gameId: string, userId: string): Promise<boolean>;
  setGameAnswer(gameId: string, userId: string, answer: string): Promise<QuizGameAnswerViewModel | null>;
  getPlayerActiveGame(userId: string): Promise<QuizGameViewModel | null>;
  getAwaitedGameId(): Promise<string | null>;
  createNewGame(userData: { userId: string; userLogin: string }): Promise<QuizGameViewModel | null>;
  connectToGame(gameId: string, userData: { userId: string; userLogin: string }): Promise<QuizGameViewModel | null>;
  getPlayerProgress(userId: string): Promise<QuizGamePlayerProgressDBType | null>;
  updateQuestion(quizQuestionId: string, model: QuizGameQuestionUpdateModel): Promise<boolean>;
  updateQuestionPublishState(quizQuestionId: string, model: QuizGameQuestionPublishUpdateModel): Promise<boolean>;
}

export const QuizGameQueryRepoKey = Symbol('QUIZ_GAME_QUERY_REPO');

export interface IQuizGameQueryRepository {
  getGameById(gameId: string): Promise<QuizGameViewModel | null>;
  getQuestionById(quizQuestionId: string): Promise<QuizGameQuestionViewModel | null>;
  getAllQuestions(query: QuizPaginationQueryDto): Promise<WithPagination<QuizGameQuestionViewModel>>;
}
