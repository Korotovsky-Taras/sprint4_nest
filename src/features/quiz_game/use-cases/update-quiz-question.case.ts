import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { Inject } from '@nestjs/common';
import { IQuizGameRepository, QuizGameRepoKey } from '../types/common';
import { QuizResultError } from '../types/errors';
import { QuizQuestionUpdateDto } from '../dto/QuizQuestionUpdateDto';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';

export class UpdateQuizQuestionCommand {
  constructor(
    public readonly questionId: string,
    public readonly dto: QuizQuestionUpdateDto,
  ) {}
}

@CommandHandler(UpdateQuizQuestionCommand)
export class UpdateQuizQuestionCase implements ICommandHandler<UpdateQuizQuestionCommand> {
  constructor(@Inject(QuizGameRepoKey) private readonly quizRepo: IQuizGameRepository<any>) {}

  async execute({ questionId, dto }: UpdateQuizQuestionCommand): Promise<ServiceResult> {
    await validateOrRejectDto(dto, QuizQuestionUpdateDto);
    const result = new ServiceResult();

    const isUpdated = await this.quizRepo.updateQuestion(questionId, {
      body: dto.body,
      correctAnswers: dto.correctAnswers,
    });

    if (!isUpdated) {
      result.addError({
        code: QuizResultError.QUIZ_QUESTION_NOT_FOUND,
      });
    }

    return result;
  }
}
