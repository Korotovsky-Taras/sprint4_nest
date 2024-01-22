import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';
import { QuizGameQuestionViewModel } from '../types/dto';
import { QuizQuestionCreateDto } from '../dto/QuizQuestionCreateDto';
import { IQuizGameRepository, QuizGameRepoKey } from '../types/common';
import { Inject } from '@nestjs/common';

export class CreateQuizQuestionCommand {
  constructor(public readonly dto: QuizQuestionCreateDto) {}
}

@CommandHandler(CreateQuizQuestionCommand)
export class CreateQuizQuestionCase implements ICommandHandler<CreateQuizQuestionCommand> {
  constructor(@Inject(QuizGameRepoKey) private readonly quizRepo: IQuizGameRepository<any>) {}

  async execute({ dto }: CreateQuizQuestionCommand): Promise<QuizGameQuestionViewModel> {
    await validateOrRejectDto(dto, QuizQuestionCreateDto);
    const correctAnswers = dto.correctAnswers.map(String);

    return await this.quizRepo.createQuestion({
      published: false,
      body: dto.body,
      correctAnswers,
    });
  }
}
