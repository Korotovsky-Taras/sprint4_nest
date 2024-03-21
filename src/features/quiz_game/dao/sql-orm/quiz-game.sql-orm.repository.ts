import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { IQuizGameRepository } from '../../types/common';
import { InjectDataSource, InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { QuizGameEntity } from './entities/quiz-game.entity';
import { QuizGameQuestionsEntity } from './entities/quiz-game-questions.entity';
import { QuizGamePlayerProgressEntity } from './entities/quiz-game-player-progress.entity';
import { QuizGameProgressAnswersEntity } from './entities/quiz-game-progress-answers.entity';
import {
  GameViewAndPlayersIdCortege,
  QuizGameAnswerViewModel,
  QuizGameQuestionCreateModel,
  QuizGameQuestionPublishUpdateModel,
  QuizGameQuestionUpdateModel,
  QuizGameQuestionViewModel,
  QuizGameViewModel,
} from '../../types/dto';
import { QuizGameAnswerStatus, QuizGameStatus } from '../../types/dao';
import { QuizGameSqlOrmDataMapper } from './quiz-game.sql-orm.dm';

@Injectable()
export class QuizGameSqlOrmRepository implements IQuizGameRepository<any> {
  constructor(
    @InjectRepository(QuizGameEntity) private gameRepo: Repository<QuizGameEntity>,
    @InjectRepository(QuizGameQuestionsEntity) private gameQuestionsRepo: Repository<QuizGameQuestionsEntity>,
    @InjectRepository(QuizGamePlayerProgressEntity) private gamePlayerProgressRepo: Repository<QuizGamePlayerProgressEntity>,
    @InjectRepository(QuizGameProgressAnswersEntity) private gameAnswersProgressRepo: Repository<QuizGamePlayerProgressEntity>,
    @InjectDataSource() private dataSource: DataSource,
    @InjectEntityManager() private manager: EntityManager,
  ) {}

  async createQuestion(model: QuizGameQuestionCreateModel): Promise<QuizGameQuestionViewModel> {
    const entity = QuizGameQuestionsEntity.create(model);
    await this.gameQuestionsRepo.save(entity);
    return QuizGameSqlOrmDataMapper.toQuestionView(entity);
  }

  async updateQuestion(quizQuestionId: string, model: QuizGameQuestionUpdateModel): Promise<boolean> {
    const entity: QuizGameQuestionsEntity | null = await this.gameQuestionsRepo.findOne({
      where: {
        _id: Number(quizQuestionId),
      },
    });
    if (entity == null) {
      return false;
    }

    entity.body = model.body;
    entity.correctAnswers = model.correctAnswers;

    await this.gameQuestionsRepo.save(entity);
    return true;
  }

  async updateQuestionPublishState(quizQuestionId: string, model: QuizGameQuestionPublishUpdateModel): Promise<boolean> {
    const entity: QuizGameQuestionsEntity | null = await this.gameQuestionsRepo.findOne({
      where: {
        _id: Number(quizQuestionId),
      },
    });
    if (entity == null) {
      return false;
    }

    entity.published = model.published;

    await this.gameQuestionsRepo.save(entity);
    return true;
  }

  async deleteQuestionById(quizQuestionId: string): Promise<boolean> {
    const res = await this.gameQuestionsRepo.delete({ _id: Number(quizQuestionId) });
    return res.affected != null && res.affected > 0;
  }

  async connectSecondPlayerToGame(gameId: string, userData: { userId: string; userLogin: string }): Promise<QuizGameViewModel | null> {
    const entity = await this.findGameEntityById(Number(gameId));

    if (entity) {
      const qb = this.manager.getRepository(QuizGameQuestionsEntity).createQueryBuilder();
      const questions = await qb.where('published = true').orderBy('random()').limit(5).getMany();

      entity.secondPlayerProgress = QuizGamePlayerProgressEntity.create(Number(userData.userId));
      entity.questions = questions;
      entity.status = 1;

      entity.startGameDate = new Date();

      await this.gameRepo.save(entity);
    }

    const game = await this.findGameEntityById(Number(gameId));

    if (game) {
      return QuizGameSqlOrmDataMapper.toGameView(game);
    }

    return null;
  }

  async createNewGame(userData: { userId: string; userLogin: string }): Promise<QuizGameViewModel | null> {
    const entity = new QuizGameEntity();
    const userId = Number(userData.userId);
    entity.firstPlayerProgress = QuizGamePlayerProgressEntity.create(userId);
    await this.gameRepo.save(entity);

    const game = await this.findGameEntityById(entity._id);
    if (game != null) {
      return QuizGameSqlOrmDataMapper.toGameView(game);
    }
    return null;
  }

  async getAwaitedGameId(): Promise<string | null> {
    const game = await this.gameRepo.findOneBy({ status: 0 });

    if (game !== null) {
      return String(game._id);
    }
    return null;
  }

  async getGameAndPlayers(gameId: string): Promise<GameViewAndPlayersIdCortege | null> {
    const game: QuizGameEntity | null = await this.findGameEntityById(Number(gameId));
    if (game !== null) {
      return [QuizGameSqlOrmDataMapper.toGameView(game), [String(game.firstPlayerProgress.userId), String(game.secondPlayerProgress?.userId)]];
    }
    return null;
  }

  async getPlayerGameWithStatus(userId: string, gameStatus: QuizGameStatus[]): Promise<QuizGameViewModel | null> {
    const qb = this.manager.getRepository(QuizGameEntity).createQueryBuilder('game');
    const quizGameEntitySelectQueryBuilder = qb
      .leftJoinAndSelect('game.firstPlayerProgress', 'fp')
      .leftJoinAndSelect('fp.user', 'fp_user')
      .leftJoinAndSelect('fp.answers', 'fp_answers')
      .leftJoinAndSelect('game.secondPlayerProgress', 'sp')
      .leftJoinAndSelect('sp.user', 'sp_user')
      .leftJoinAndSelect('sp.answers', 'sp_answers')
      .leftJoinAndSelect('game.questions', 'questions')
      .orderBy({
        'questions._id': 'ASC',
        'fp_answers._id': 'ASC',
        'sp_answers._id': 'ASC',
      })
      .where(`game.status IN (${gameStatus.join(', ')}) AND (fp."userId" = :userId OR sp."userId" = :userId)`, { userId });

    const game = await quizGameEntitySelectQueryBuilder.getOne();

    if (game) {
      return QuizGameSqlOrmDataMapper.toGameView(game);
    }
    return null;
  }

  async isUserFinishInActiveGame(gameId: string, userId: string): Promise<boolean> {
    const qb = this.manager.getRepository(QuizGameEntity).createQueryBuilder('game');
    const game = await qb
      .leftJoinAndSelect('game.firstPlayerProgress', 'fp')
      .leftJoinAndSelect('fp.user', 'fp_user')
      .leftJoinAndSelect('game.secondPlayerProgress', 'sp')
      .leftJoinAndSelect('sp.user', 'sp_user')
      .where(`game.status = 1 AND ((fp."userId" = :userId AND fp.status = 1) OR (sp."userId" = :userId AND sp.status = 1))`, { userId })
      .getOne();
    return game != null;
  }

  async isUserInActiveGame(userId: string): Promise<boolean> {
    const qb = this.manager.getRepository(QuizGameEntity).createQueryBuilder('game');
    const game = await qb
      .leftJoinAndSelect('game.firstPlayerProgress', 'fp')
      .leftJoinAndSelect('fp.user', 'fp_user')
      .leftJoinAndSelect('game.secondPlayerProgress', 'sp')
      .leftJoinAndSelect('sp.user', 'sp_user')
      .where(`game.status IN (0,1) AND (fp."userId" = :userId OR sp."userId" = :userId)`, { userId })
      .getOne();
    return game != null;
  }

  async setGameAnswer(gameId: string, userId: string, answer: string): Promise<QuizGameAnswerViewModel | null> {
    //получаем id второго игрока
    const game = await this.findGameEntityById(Number(gameId));

    if (!game || game.firstPlayerProgress == null || game.secondPlayerProgress == null || game.questions == null) {
      return null;
    }

    const isCurrentFirst: boolean = game.firstPlayerProgress.userId == Number(userId);

    const currentProgress = isCurrentFirst ? game.firstPlayerProgress : game.secondPlayerProgress;
    const otherProgress = isCurrentFirst ? game.secondPlayerProgress : game.firstPlayerProgress;

    const isCurrentPlayerLastQuestion = game.questions.length - currentProgress.answers.length === 1;
    const isOtherPlayerFinishGame = game.questions.length - otherProgress.answers.length === 0;

    const nextQuestion = game.questions[currentProgress.answers.length] || null;

    //если есть еще вопросы
    if (nextQuestion !== null) {
      //ищем сравниваем ответ
      const isCorrect = nextQuestion.correctAnswers.some((a) => a.toLowerCase() === answer.toLowerCase());
      const questionStatus = isCorrect ? QuizGameAnswerStatus.Correct : QuizGameAnswerStatus.Incorrect;

      const currentPlayerAnswerEntity = QuizGameProgressAnswersEntity.create(currentProgress._id, nextQuestion._id, questionStatus, answer);

      currentProgress.answers.push(currentPlayerAnswerEntity);

      if (isCorrect) {
        currentProgress.score += 1;
      }

      // если отвечаем на последний вопрос
      // необходимо посчитать бонусы
      if (isCurrentPlayerLastQuestion) {
        // Изменяем статус прогресса игрока на "завершил отвечать"
        currentProgress.status = 1;

        if (isOtherPlayerFinishGame) {
          // пересчитать бонусы текущего игрока
          currentProgress.score += currentProgress.bonusScore;
          currentProgress.bonusScore = 0;

          // пересчитать бонусы второго игрока
          otherProgress.score += otherProgress.bonusScore;
          otherProgress.bonusScore = 0;

          // закончить игру
          game.status = 2;
          game.finishGameDate = new Date();
        } else {
          // добавить бонусное очко текущему игроку
          currentProgress.bonusScore += 1;
        }
      }

      await this.gameRepo.save(game);

      return QuizGameSqlOrmDataMapper.toAnswerView(currentPlayerAnswerEntity);
    }

    return null;
  }

  async clear(): Promise<void> {
    await this.gameRepo.createQueryBuilder().delete().from(QuizGameEntity).where('1=1').execute();
    await this.gameRepo.createQueryBuilder().delete().from(QuizGamePlayerProgressEntity).where('1=1').execute();
    await this.gameRepo.createQueryBuilder().delete().from(QuizGameQuestionsEntity).where('1=1').execute();
  }

  async saveDoc(doc: any): Promise<void> {
    return Promise.resolve(undefined);
  }

  private async findGameEntityById(gameId: number): Promise<QuizGameEntity | null> {
    const qb = this.manager.getRepository(QuizGameEntity).createQueryBuilder('game');
    const game = await qb
      .leftJoinAndSelect('game.firstPlayerProgress', 'fp')
      .leftJoinAndSelect('fp.user', 'fp_user')
      .leftJoinAndSelect('fp.answers', 'fp_answers')
      .leftJoinAndSelect('game.secondPlayerProgress', 'sp')
      .leftJoinAndSelect('sp.user', 'sp_user')
      .leftJoinAndSelect('sp.answers', 'sp_answers')
      .leftJoinAndSelect('game.questions', 'questions')
      .where(`game._id = :gameId`, { gameId })
      .orderBy({
        'questions._id': 'ASC',
        'fp_answers._id': 'ASC',
        'sp_answers._id': 'ASC',
      })
      .getOne();
    return game;
  }
}
