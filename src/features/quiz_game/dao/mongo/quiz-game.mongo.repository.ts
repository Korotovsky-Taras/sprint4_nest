import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { IQuizGameRepository } from '../../types/common';
import {
  IQuizGameModel,
  IQuizGamePlayerAnswer,
  IQuizGamePlayerProgressModel,
  IQuizGameQuestionsModel,
  QuizGameAnswerStatus,
  QuizGameDBPType,
  QuizGameDBType,
  QuizGameDocumentType,
  QuizGamePlayerProgressDocumentType,
  QuizGameProgressStatus,
  QuizGameQuestionDocumentType,
  QuizGameStatus,
} from '../../types/dao';
import { InjectModel } from '@nestjs/mongoose';
import { QuizGame } from './quiz-game.mongo.schema';
import { QuizGameQuestion } from './quiz-game-question.mongo.schema';
import { DeleteResult, ObjectId } from 'mongodb';
import { HydratedDocument, isValidObjectId } from 'mongoose';
import {
  GameViewAndPlayersIdCortege,
  QuizGameAnswerViewModel,
  QuizGameQuestionCreateModel,
  QuizGameQuestionPublishUpdateModel,
  QuizGameQuestionUpdateModel,
  QuizGameQuestionViewModel,
  QuizGameViewModel,
} from '../../types/dto';
import { QuizGameMongoDataMapper } from './quiz-game.mongo.dm';
import { QuizGamePlayerProgress } from './quiz-game-player-progress.mongo.schema';

@Injectable()
export class QuizGameMongoRepository implements IQuizGameRepository<HydratedDocument<any>> {
  constructor(
    @InjectModel(QuizGame.name) private quizGameModel: IQuizGameModel,
    @InjectModel(QuizGamePlayerProgress.name) private quizGameProgressModel: IQuizGamePlayerProgressModel,
    @InjectModel(QuizGameQuestion.name) private quizGameQuestionsModel: IQuizGameQuestionsModel,
  ) {}

  async createQuestion(model: QuizGameQuestionCreateModel): Promise<QuizGameQuestionViewModel> {
    const question: QuizGameQuestionDocumentType = await this.quizGameQuestionsModel.createQuestion(model);
    await this.saveDoc(question);
    return QuizGameMongoDataMapper.toQuestionView(question);
  }

  async deleteQuestionById(quizQuestionId: string): Promise<boolean> {
    if (!isValidObjectId(quizQuestionId)) {
      return false;
    }
    const result: DeleteResult = await this.quizGameQuestionsModel.deleteOne({ _id: new ObjectId(quizQuestionId) }).exec();
    return result.deletedCount === 1;
  }

  async isUserInActiveGame(userId: string): Promise<boolean> {
    const game = await this.quizGameModel.findOne({
      status: { $in: [QuizGameStatus.PendingSecondPlayer, QuizGameStatus.Active] },
      players: { $in: [new ObjectId(userId)] },
    });

    return game !== null;
  }

  async isUserFinishInActiveGame(gameId: string, userId: string): Promise<boolean> {
    const game = await this.quizGameModel.findById(gameId).exec();

    if (game != null && game.status === QuizGameStatus.Active) {
      const st = await this.quizGameProgressModel
        .findOne({
          gameId,
          'player.playerId': userId,
          status: QuizGameProgressStatus.Finished,
        })
        .exec();

      return st != null;
    }

    return false;
  }

  async setGameAnswer(gameId: string, userId: string, answer: string): Promise<QuizGameAnswerViewModel | null> {
    const game: QuizGameDocumentType | null = await this.quizGameModel
      .findOne({
        _id: new ObjectId(gameId),
        status: QuizGameStatus.Active,
      })
      .exec();

    if (game === null) {
      throw new Error('no game for this action');
    }

    const g2 = await this.quizGameModel.populate<QuizGameDBPType>(game, { path: 'questions' });

    const userProgress: QuizGamePlayerProgressDocumentType | null = await this.quizGameProgressModel
      .findOne({
        gameId,
        'player.playerId': userId,
        status: QuizGameProgressStatus.Active,
      })
      .exec();

    if (!userProgress || g2.questions == null || g2.questions.length == 0) {
      throw new Error('game has no questions for some reason');
    }

    const question = g2.questions[userProgress.answers.length];
    const answerStatus = question.correctAnswers.includes(answer) ? QuizGameAnswerStatus.Correct : QuizGameAnswerStatus.Incorrect;
    const playerAnswer: IQuizGamePlayerAnswer = {
      questionId: String(question._id),
      answerStatus: answerStatus,
      addedAt: new Date(),
    };

    userProgress.answers.push(playerAnswer);

    if (answerStatus === QuizGameAnswerStatus.Correct) {
      userProgress.score += 1;
      await this.saveDoc(userProgress);
    }

    const secondPlayerProgressId = String(game.firstPlayerProgress) === String(userProgress._id) ? game.secondPlayerProgress : game.firstPlayerProgress;

    const secondUserProgress: QuizGamePlayerProgressDocumentType | null = await this.quizGameProgressModel.findById(secondPlayerProgressId).exec();

    if (secondUserProgress === null) {
      throw new Error('game should have second player');
    }

    if (userProgress.answers.length === g2.questions.length) {
      userProgress.setStatus(QuizGameProgressStatus.Finished);

      //если пользователь закончил раньше, и у него был один правильный ответ, добавляем ему очки
      if (userProgress.score > 0 && secondUserProgress.status === QuizGameProgressStatus.Active) {
        userProgress.bonusScore += 1;
      }
    }

    if (userProgress.status === QuizGameProgressStatus.Finished && secondUserProgress.status === QuizGameProgressStatus.Finished) {
      game.finishGame();

      userProgress.score += userProgress.bonusScore;
      secondUserProgress.score += secondUserProgress.bonusScore;

      userProgress.bonusScore = 0;
      secondUserProgress.bonusScore = 0;
    }

    await this.saveDoc(userProgress);
    await this.saveDoc(secondUserProgress);
    await this.saveDoc(game);

    return QuizGameMongoDataMapper.toAnswerView(playerAnswer);
  }

  async getPlayerGameWithStatus(userId: string, gameStatus: QuizGameStatus[]): Promise<QuizGameViewModel | null> {
    const game: QuizGameDocumentType | null = await this.quizGameModel.findOne({
      status: { $in: [...gameStatus] },
      players: { $in: [new ObjectId(userId)] },
    });

    if (game !== null) {
      const g2 = await this.quizGameModel.populate<QuizGameDBPType>(game, [
        { path: 'firstPlayerProgress' },
        { path: 'secondPlayerProgress' },
        { path: 'questions' },
      ]);

      return QuizGameMongoDataMapper.toGameView(g2);
    }

    return null;
  }

  async getGameAndPlayers(gameId: string): Promise<GameViewAndPlayersIdCortege | null> {
    const game: QuizGameDocumentType | null = await this.quizGameModel.findOne({
      _id: new ObjectId(gameId),
    });

    if (game !== null) {
      const g2 = await this.quizGameModel.populate<QuizGameDBPType>(game, [
        { path: 'firstPlayerProgress' },
        { path: 'secondPlayerProgress' },
        { path: 'questions' },
      ]);

      return [QuizGameMongoDataMapper.toGameView(g2), game.players.map(String)];
    }

    return null;
  }

  async connectSecondPlayerToGame(gameId: string, userData: { userId: string; userLogin: string }): Promise<QuizGameViewModel | null> {
    const game: QuizGameDocumentType | null = await this.quizGameModel.findById(gameId).exec();

    if (!game || game.secondPlayerProgress !== null) {
      return null;
    }

    const playerProgress = this.quizGameProgressModel.createProgress(userData, gameId);

    await this.saveDoc(playerProgress);

    game.applySecondPlayer(playerProgress._id, new ObjectId(userData.userId));

    const questions = await this.quizGameQuestionsModel
      .aggregate<ObjectId>([
        { $match: { published: true } },
        { $sample: { size: 10 } }, // выбираем случайные 10 документов, чтобы было больше шансов на уникальность
        { $project: { _id: 1 } },
        { $limit: 10 }, // ограничиваем результат до 10 документов
        { $group: { _id: null, ids: { $addToSet: '$_id' } } }, // собираем все _id в массив ids
        { $unwind: '$ids' }, // разворачиваем массив ids
        { $sample: { size: 5 } }, // выбираем случайные 5 уникальных _id
        { $project: { _id: '$ids' } }, // переименовываем поле ids в _id
      ])
      .exec();

    game.applyQuestions(questions);
    game.startGame();

    await this.saveDoc(game);

    const g2 = await this.quizGameModel.populate<QuizGameDBPType>(game, [
      { path: 'firstPlayerProgress' },
      { path: 'secondPlayerProgress' },
      { path: 'questions' },
    ]);

    return QuizGameMongoDataMapper.toGameView(g2);
  }

  async createNewGame(userData: { userId: string; userLogin: string }): Promise<QuizGameViewModel | null> {
    const game = this.quizGameModel.createGame();

    await this.saveDoc(game);

    const playerProgress = this.quizGameProgressModel.createProgress(userData, String(game._id));

    await this.saveDoc(playerProgress);
    game.applyFirstPlayer(playerProgress._id, new ObjectId(userData.userId));

    await this.saveDoc(game);

    const g2 = await this.quizGameModel.populate<QuizGameDBPType>(game, { path: 'firstPlayerProgress' });

    return QuizGameMongoDataMapper.toGameView(g2);
  }

  async getAwaitedGameId(): Promise<string | null> {
    const game: QuizGameDBType | null = await this.quizGameModel.findOne({ secondPlayerProgress: null, status: QuizGameStatus.PendingSecondPlayer }).lean();
    if (game !== null) {
      return game._id.toString();
    }
    return null;
  }

  async updateQuestion(quizQuestionId: string, model: QuizGameQuestionUpdateModel): Promise<boolean> {
    if (!isValidObjectId(quizQuestionId)) {
      return false;
    }

    const question: QuizGameQuestionDocumentType | null = await this.quizGameQuestionsModel.findById(quizQuestionId).exec();

    if (question == null) {
      return false;
    }

    question.body = model.body;
    question.correctAnswers = model.correctAnswers;

    await this.saveDoc(question);

    return true;
  }

  async updateQuestionPublishState(quizQuestionId: string, model: QuizGameQuestionPublishUpdateModel): Promise<boolean> {
    if (!isValidObjectId(quizQuestionId)) {
      return false;
    }

    const question: QuizGameQuestionDocumentType | null = await this.quizGameQuestionsModel.findById(quizQuestionId).exec();

    if (question == null) {
      return false;
    }

    question.published = model.published;

    await this.saveDoc(question);

    return true;
  }

  async saveDoc(doc: HydratedDocument<any>): Promise<void> {
    await doc.save();
  }

  async clear(): Promise<void> {
    await this.quizGameQuestionsModel.deleteMany({});
    await this.quizGameProgressModel.deleteMany({});
    await this.quizGameModel.deleteMany({});
  }
}
