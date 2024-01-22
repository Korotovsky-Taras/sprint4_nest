import { ObjectId, WithId } from 'mongodb';
import { HydratedDocument, Model } from 'mongoose';
import { QuizGamePlayerProgressCreateModel, QuizGameQuestionCreateModel } from './dto';

export enum QuizGameStatus {
  PendingSecondPlayer = 0,
  Active = 1,
  Finished = 2,
}

export type QuizGameStatusKeys = keyof typeof QuizGameStatus;

export enum QuizGameAnswerStatus {
  Correct = 0,
  Incorrect = 1,
}

export type QuizGameAnswerStatusKeys = keyof typeof QuizGameAnswerStatus;

export enum QuizGameProgressStatus {
  Active = 0,
  Finished = 1,
}

export type IQuizGamePlayer = {
  playerId: string;
  playerLogin: string;
};

export type IQuizGamePlayerAnswer = {
  questionId: string;
  answerStatus: QuizGameAnswerStatus;
  addedAt: Date;
};

export interface IQuizGamePlayerProgress {
  player: IQuizGamePlayer;
  answers: IQuizGamePlayerAnswer[];
  score: number;
  createdAt: Date;
  updatedAt: Date;
}

export type QuizGamePlayerProgressDBType = WithId<IQuizGamePlayerProgress>;

export type QuizGamePlayerProgressDocumentType = HydratedDocument<IQuizGamePlayerProgress, IQuizGamePlayerProgressMethods>;

export interface IQuizGamePlayerProgressMethods {
  setStatus(status: QuizGameProgressStatus);
}

export interface IQuizGamePlayerProgressModel extends Model<QuizGamePlayerProgressDocumentType, IQuizGamePlayerProgressMethods> {
  createProgress(input: QuizGamePlayerProgressCreateModel, gameId: string): QuizGamePlayerProgressDocumentType;
}

export interface IQuizGame<P, Q> {
  players: ObjectId[];
  firstPlayerProgress: P;
  secondPlayerProgress: P | null;
  questions: Q[] | null;
  status: QuizGameStatus;
  createdAt: Date;
  startGameDate: Date;
  finishGameDate: Date;
}

export type QuizGameDBType = WithId<IQuizGame<ObjectId, ObjectId>>;

export type QuizGameDBPType = WithId<IQuizGame<QuizGamePlayerProgressDBType, QuizGameQuestionDBType>>;

export type QuizGameDocumentType = HydratedDocument<IQuizGame<ObjectId, ObjectId>, IQuizGameMethods>;

export type QuizGameDocumentPType = HydratedDocument<IQuizGame<QuizGamePlayerProgressDBType, QuizGameQuestionDBType>, IQuizGameMethods>;

export interface IQuizGameMethods {
  applyFirstPlayer(playerProgressId: ObjectId, playerId: ObjectId);
  applySecondPlayer(playerProgressId: ObjectId, playerId: ObjectId);
  applyQuestions(questions: ObjectId[]);
  finishGame();
  startGame();
}

export interface IQuizGameModel extends Model<QuizGameDocumentType, IQuizGameMethods> {
  createGame(): QuizGameDocumentType;
}

export interface IQuizGameQuestion {
  body: string;
  correctAnswers: string[];
  published: boolean;
  createdAt: Date;
  updatedAt: Date | null;
}

export type QuizGameQuestionDBType = WithId<IQuizGameQuestion>;

export type QuizGameQuestionDocumentType = HydratedDocument<IQuizGameQuestion, IQuizGameQuestionMethods>;

export interface IQuizGameQuestionMethods {}

export interface IQuizGameQuestionsModel extends Model<QuizGameQuestionDocumentType, IQuizGameQuestionMethods> {
  createQuestion(input: QuizGameQuestionCreateModel): QuizGameQuestionDocumentType;
}
