import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IQuizGameRepository, QuizGameRepoKey } from '../types/common';
import { Inject } from '@nestjs/common';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { QuizResultError } from '../types/errors';
import { QuizGameViewModel } from '../types/dto';
import { QuizGameStatus } from '../types/dao';

export class GetMyCurrentGameCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(GetMyCurrentGameCommand)
export class GetMyCurrentGameCase implements ICommandHandler<GetMyCurrentGameCommand> {
  constructor(@Inject(QuizGameRepoKey) private readonly quizRepo: IQuizGameRepository<any>) {}

  async execute({ userId }: GetMyCurrentGameCommand): Promise<ServiceResult<QuizGameViewModel>> {
    const res = new ServiceResult<QuizGameViewModel>();

    const game: QuizGameViewModel | null = await this.quizRepo.getPlayerGameWithStatus(userId, [QuizGameStatus.Active, QuizGameStatus.PendingSecondPlayer]);

    if (game == null) {
      res.addError({
        code: QuizResultError.QUIZ_GAME_NO_FOUND,
      });
      return res;
    }

    res.setData(game);

    return res;
  }
}
