import { DeleteQuizQuestionCase } from './delete-quiz-question.case';
import { CreateQuizQuestionCase } from './create-quiz-question.case';
import { UpdateQuizQuestionCase } from './update-quiz-question.case';
import { UpdateQuizQuestionPublishCase } from './update-quiz-question-publish.case';
import { CreateQuizConnectionCase } from './create-quiz-connection.case';
import { GetMyCurrentGameCase } from './get-my-current-game.case';
import { SetMyCurrentGameAnswerCase } from './set-my-current-game-answer.case';
import { GetGameByIdCase } from './get-game-by-id.case';

export const quizCases = [
  DeleteQuizQuestionCase,
  CreateQuizQuestionCase,
  UpdateQuizQuestionCase,
  UpdateQuizQuestionPublishCase,
  CreateQuizConnectionCase,
  GetMyCurrentGameCase,
  GetGameByIdCase,
  SetMyCurrentGameAnswerCase,
];
