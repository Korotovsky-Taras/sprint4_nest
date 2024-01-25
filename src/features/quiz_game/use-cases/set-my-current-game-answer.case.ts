import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IQuizGameRepository, QuizGameRepoKey } from '../types/common';
import { Inject } from '@nestjs/common';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { QuizAnswerDto } from '../dto/QuizAnswerDto';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';
import { QuizResultError } from '../types/errors';
import { QuizGameAnswerViewModel } from '../types/dto';
import { QuizGameStatus } from '../types/dao';

export class SetMyCurrentGameAnswerCommand {
  constructor(
    public readonly userId: string,
    public readonly dto: QuizAnswerDto,
  ) {}
}

@CommandHandler(SetMyCurrentGameAnswerCommand)
export class SetMyCurrentGameAnswerCase implements ICommandHandler<SetMyCurrentGameAnswerCommand> {
  constructor(@Inject(QuizGameRepoKey) private readonly quizRepo: IQuizGameRepository<any>) {}

  async execute({ userId, dto }: SetMyCurrentGameAnswerCommand): Promise<ServiceResult<QuizGameAnswerViewModel>> {
    await validateOrRejectDto(dto, QuizAnswerDto);

    const res = new ServiceResult<QuizGameAnswerViewModel>();

    const game = await this.quizRepo.getPlayerGameWithStatus(userId, [QuizGameStatus.Active]);

    if (game === null) {
      res.addError({
        code: QuizResultError.QUIZ_GAME_NO_PERMISSION,
      });
      return res;
    }

    const isUserFinishTheGame = await this.quizRepo.isUserFinishInActiveGame(game.id, userId);

    console.log({ userId, isUserFinishTheGame });

    if (isUserFinishTheGame) {
      res.addError({
        code: QuizResultError.QUIZ_GAME_NO_PERMISSION,
      });
      return res;
    }

    const answer = await this.quizRepo.setGameAnswer(game.id, userId, dto.answer);

    if (answer != null) {
      res.setData(answer);
    }

    return res;
  }
}
