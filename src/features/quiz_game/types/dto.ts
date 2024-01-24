import { IQuizGameQuestion, QuizGameAnswerStatusKeys } from './dao';
import { ObjectId } from 'mongodb';

export type QuizGameAnswerViewModel = { questionId: string; answerStatus: QuizGameAnswerStatusKeys; addedAt: string };

export type QuizGamePlayerProgressViewModel = {
  player: { id: string; login: string };
  answers: QuizGameAnswerViewModel[];
  score: number;
};

export type QuizGameQuestionShortViewModel = {
  id: string;
  body: string;
};

export type QuizGameViewModel = {
  id: string;
  firstPlayerProgress: QuizGamePlayerProgressViewModel | null;
  secondPlayerProgress: QuizGamePlayerProgressViewModel | null;
  questions: QuizGameQuestionShortViewModel[] | null;
  pairCreatedDate: string;
  startGameDate: string | null;
  finishGameDate: string | null;
  status: string;
};

export type GameViewAndPlayersIdCortege = [QuizGameViewModel, string[]];

export type QuizGameQuestionViewModel = Pick<IQuizGameQuestion, 'body' | 'correctAnswers' | 'published'> & {
  id: string;
  createdAt: string;
  updatedAt: string | null;
};

export type QuizGameCreateModel = Pick<IQuizGameQuestion, 'body' | 'correctAnswers' | 'published'> & { firstPlayerProgress: ObjectId };

export type QuizGamePlayerProgressCreateModel = { userId: string; userLogin: string };

export type QuizGameQuestionCreateModel = Pick<IQuizGameQuestion, 'body' | 'correctAnswers' | 'published'>;

export type QuizGameQuestionUpdateModel = Pick<IQuizGameQuestion, 'body' | 'correctAnswers'>;

export type QuizGameQuestionPublishUpdateModel = Pick<IQuizGameQuestion, 'published'>;
