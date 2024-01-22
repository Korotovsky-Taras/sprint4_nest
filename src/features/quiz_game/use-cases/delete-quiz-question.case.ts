import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { Inject } from '@nestjs/common';
import { IQuizGameRepository, QuizGameRepoKey } from '../types/common';
import { QuizResultError } from '../types/errors';

export class DeleteQuizQuestionCommand {
  constructor(public readonly questionId: string) {}
}

@CommandHandler(DeleteQuizQuestionCommand)
export class DeleteQuizQuestionCase implements ICommandHandler<DeleteQuizQuestionCommand> {
  constructor(@Inject(QuizGameRepoKey) private readonly quizRepo: IQuizGameRepository<any>) {}

  async execute({ questionId }: DeleteQuizQuestionCommand): Promise<ServiceResult> {
    const result = new ServiceResult();

    const isDeleted = await this.quizRepo.deleteQuestionById(questionId);

    if (!isDeleted) {
      result.addError({
        code: QuizResultError.QUIZ_QUESTION_NOT_FOUND,
      });
    }

    return result;
  }
}
