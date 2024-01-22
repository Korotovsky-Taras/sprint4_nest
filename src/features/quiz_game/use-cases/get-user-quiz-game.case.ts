import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { QuizGameViewModel } from '../types/dto';
import { IQuizGameQueryRepository, QuizGameQueryRepoKey } from '../types/common';
import { Inject } from '@nestjs/common';
import { ServiceResult } from '../../../application/core/ServiceResult';

export class GetUserQuizGameCommand {
  constructor(
    public readonly gameId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(GetUserQuizGameCommand)
export class CreateQuizQuestionCase implements ICommandHandler<GetUserQuizGameCommand> {
  constructor(@Inject(QuizGameQueryRepoKey) private readonly quizQueryRepo: IQuizGameQueryRepository) {}

  async execute({ userId, gameId }: GetUserQuizGameCommand): Promise<ServiceResult<QuizGameViewModel>> {
    const res = new ServiceResult<QuizGameViewModel>();

    this.quizQueryRepo.getGameById(gameId);

    return res;
  }
}
