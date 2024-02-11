import {
  QuizGameAnswerRawType,
  QuizGameAnswerStatus,
  QuizGameAnswerStatusKeys,
  QuizGamePlayerProgressRawType,
  QuizGameQuestionRawType,
  QuizGameRawType,
  QuizGameStatus,
  QuizGameStatusKeys,
} from '../../types/dao';
import {
  QuizGameAnswerViewModel,
  QuizGamePlayerProgressViewModel,
  QuizGameQuestionShortViewModel,
  QuizGameQuestionViewModel,
  QuizGameViewModel,
} from '../../types/dto';
import { toIsoString } from '../../../../application/utils/date';

export class QuizGameSqlRawDataMapper {
  static toQuestionView(question: QuizGameQuestionRawType): QuizGameQuestionViewModel {
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
      return QuizGameSqlRawDataMapper.toQuestionView(question);
    });
  }
  static toGameView(game: QuizGameRawType): QuizGameViewModel {
    return {
      id: String(game._id),
      firstPlayerProgress: QuizGameSqlRawDataMapper.toPlayerProgress(game.firstPlayerProgress),
      secondPlayerProgress: QuizGameSqlRawDataMapper.toPlayerProgress(game.secondPlayerProgress),
      pairCreatedDate: toIsoString(game.createdAt),
      startGameDate: toIsoString(game.startGameDate),
      finishGameDate: toIsoString(game.finishGameDate),
      questions: QuizGameSqlRawDataMapper.toShortQuestionsView(game.questions),
      status: toGameStatusString(game.status),
    };
  }

  static toShortQuestionsView(questions: QuizGameQuestionRawType[] | null): QuizGameQuestionShortViewModel[] | null {
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

  static toPlayerProgress(playerProgress: QuizGamePlayerProgressRawType | null): QuizGamePlayerProgressViewModel | null {
    if (playerProgress !== null) {
      return {
        player: {
          id: String(playerProgress.player.id),
          login: playerProgress.player.login,
        },
        answers: playerProgress.answers.map((answer) => {
          return QuizGameSqlRawDataMapper.toAnswerView(answer);
        }),
        score: playerProgress.score,
      };
    }
    return null;
  }

  static toAnswerView(answer: QuizGameAnswerRawType): QuizGameAnswerViewModel {
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
