import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { Inject } from '@nestjs/common';
import { IQuizGameRepository, QuizGameRepoKey } from '../types/common';
import { QuizResultError } from '../types/errors';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';
import { QuizQuestionPublishUpdateDto } from '../dto/QuizQuestionPublishUpdateDto';

export class UpdateQuizQuestionPublishCommand {
  constructor(
    public readonly questionId: string,
    public readonly dto: QuizQuestionPublishUpdateDto,
  ) {}
}

@CommandHandler(UpdateQuizQuestionPublishCommand)
export class UpdateQuizQuestionPublishCase implements ICommandHandler<UpdateQuizQuestionPublishCommand> {
  constructor(@Inject(QuizGameRepoKey) private readonly quizRepo: IQuizGameRepository<any>) {}

  async execute({ questionId, dto }: UpdateQuizQuestionPublishCommand): Promise<ServiceResult> {
    await validateOrRejectDto(dto, QuizQuestionPublishUpdateDto);
    const result = new ServiceResult();

    const isUpdated = await this.quizRepo.updateQuestionPublishState(questionId, {
      published: dto.published,
    });

    if (!isUpdated) {
      result.addError({
        code: QuizResultError.QUIZ_QUESTION_NOT_FOUND,
      });
    }

    return result;
  }
}
