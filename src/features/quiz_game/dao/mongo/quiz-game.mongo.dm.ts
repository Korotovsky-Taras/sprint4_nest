import {
  IQuizGamePlayerAnswer,
  IQuizGamePlayerProgress,
  QuizGameAnswerStatus,
  QuizGameAnswerStatusKeys,
  QuizGameDBPType,
  QuizGameQuestionDBType,
  QuizGameQuestionDocumentType,
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

export class QuizGameMongoDataMapper {
  static toQuestionView(question: QuizGameQuestionDBType | QuizGameQuestionDocumentType): QuizGameQuestionViewModel {
    return {
      id: String(question._id),
      body: question.body,
      correctAnswers: question.correctAnswers,
      published: question.published,
      createdAt: toIsoString(question.createdAt),
      updatedAt: toIsoString(question.updatedAt),
    };
  }

  static toGameView(game: QuizGameDBPType): QuizGameViewModel {
    return {
      id: String(game._id),
      firstPlayerProgress: QuizGameMongoDataMapper.toPlayerProgress(game.firstPlayerProgress),
      secondPlayerProgress: QuizGameMongoDataMapper.toPlayerProgress(game.secondPlayerProgress),
      pairCreatedDate: toIsoString(game.createdAt),
      startGameDate: toIsoString(game.startGameDate),
      finishGameDate: toIsoString(game.finishGameDate),
      questions: QuizGameMongoDataMapper.toShortQuestionsView(game.questions),
      status: toGameStatusString(game.status),
    };
  }

  static toQuestionsView(questions: QuizGameQuestionDBType[]): QuizGameQuestionViewModel[] {
    return questions.map((q) => {
      return QuizGameMongoDataMapper.toQuestionView(q);
    });
  }

  static toAnswerView(answer: IQuizGamePlayerAnswer): QuizGameAnswerViewModel {
    return {
      questionId: answer.questionId,
      answerStatus: toAnswerStatusString(answer.answerStatus),
      addedAt: toIsoString(answer.addedAt),
    };
  }

  static toShortQuestionsView(questions: QuizGameQuestionDBType[] | null): QuizGameQuestionShortViewModel[] | null {
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

  static toPlayerProgress(playerProgress: IQuizGamePlayerProgress | null): QuizGamePlayerProgressViewModel | null {
    if (playerProgress !== null) {
      return {
        player: {
          id: playerProgress.player.playerId,
          login: playerProgress.player.playerLogin,
        },
        answers: playerProgress.answers.map((answer) => {
          return QuizGameMongoDataMapper.toAnswerView(answer);
        }),
        score: playerProgress.score,
      };
    }
    return null;
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
