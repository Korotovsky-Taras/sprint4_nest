import { QuizGameAnswerStatus, QuizGameAnswerStatusKeys, QuizGameQuestionRawType, QuizGameStatus, QuizGameStatusKeys } from '../../types/dao';
import {
  QuizGameAnswerViewModel,
  QuizGamePlayerProgressViewModel,
  QuizGameQuestionShortViewModel,
  QuizGameQuestionViewModel,
  QuizGameViewModel,
} from '../../types/dto';
import { toIsoString } from '../../../../application/utils/date';
import { QuizGameEntity } from './entities/quiz-game.entity';
import { QuizGamePlayerProgressEntity } from './entities/quiz-game-player-progress.entity';
import { QuizGameProgressAnswersEntity } from './entities/quiz-game-progress-answers.entity';
import { QuizGameQuestionsEntity } from './entities/quiz-game-questions.entity';

export class QuizGameSqlOrmDataMapper {
  static toQuestionView(question: any): QuizGameQuestionViewModel {
    return {
      id: String(question._id),
      body: question.body,
      correctAnswers: question.correctAnswers,
      published: question.published,
      createdAt: toIsoString(question.createdAt),
      updatedAt: question.updatedAt ? toIsoString(question.updatedAt) : null,
    };
  }
  static toQuestionsView(questions: QuizGameQuestionRawType[]): QuizGameQuestionViewModel[] {
    return questions.map((question) => {
      return QuizGameSqlOrmDataMapper.toQuestionView(question);
    });
  }

  static toGameView(game: QuizGameEntity): QuizGameViewModel {
    return {
      id: String(game._id),
      firstPlayerProgress: QuizGameSqlOrmDataMapper.toPlayerProgress(game.firstPlayerProgress),
      secondPlayerProgress: QuizGameSqlOrmDataMapper.toPlayerProgress(game.secondPlayerProgress),
      pairCreatedDate: toIsoString(game.createdAt),
      startGameDate: toIsoString(game.startGameDate),
      finishGameDate: toIsoString(game.finishGameDate),
      questions: QuizGameSqlOrmDataMapper.toShortQuestionsView(game.questions),
      status: toGameStatusString(game.status),
    };
  }

  static toShortQuestionsView(questions: QuizGameQuestionsEntity[] | null): QuizGameQuestionShortViewModel[] | null {
    if (questions !== null && questions.length > 0) {
      return questions.map((question) => {
        return {
          id: String(question._id),
          body: question.body,
        };
      });
    }
    return null;
  }

  static toPlayerProgress(playerProgress: QuizGamePlayerProgressEntity | null): QuizGamePlayerProgressViewModel | null {
    if (playerProgress !== null) {
      return {
        player: {
          id: String(playerProgress.user._id),
          login: playerProgress.user.login,
        },
        answers: playerProgress.answers.map((answer) => {
          return QuizGameSqlOrmDataMapper.toAnswerView(answer);
        }),
        score: playerProgress.score,
      };
    }
    return null;
  }

  static toAnswerView(answer: QuizGameProgressAnswersEntity): QuizGameAnswerViewModel {
    return {
      questionId: String(answer.questionId),
      answerStatus: toAnswerStatusString(answer.status),
      addedAt: toIsoString(answer.createdAt),
    };
  }
}

function toGameStatusString(status: QuizGameStatus): QuizGameStatusKeys {
  switch (status) {
    case QuizGameStatus.PendingSecondPlayer:
      return 'PendingSecondPlayer';
    case QuizGameStatus.Active:
      return 'Active';
    case QuizGameStatus.Finished:
      return 'Finished';
    default:
      throw new Error('Unknown status');
  }
}

function toAnswerStatusString(status: QuizGameAnswerStatus): QuizGameAnswerStatusKeys {
  switch (status) {
    case QuizGameAnswerStatus.Correct:
      return 'Correct';
    case QuizGameAnswerStatus.Incorrect:
      return 'Incorrect';
    default:
      throw new Error('Unknown status');
  }
}
