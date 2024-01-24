import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IQuizGameRepository, QuizGameQueryRepoKey, QuizGameRepoKey } from '../types/common';
import { Inject } from '@nestjs/common';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { QuizResultError } from '../types/errors';
import { GameViewAndPlayersIdCortege, QuizGameViewModel } from '../types/dto';

export class GetGameByIdCommand {
  constructor(
    public readonly gameId: string,
    public readonly userId: string,
  ) {}
}

@CommandHandler(GetGameByIdCommand)
export class GetGameByIdCase implements ICommandHandler<GetGameByIdCommand> {
  constructor(
    @Inject(QuizGameRepoKey) private readonly quizRepo: IQuizGameRepository<any>,
    @Inject(QuizGameQueryRepoKey) private readonly quizQueryRepo: IQuizGameRepository<any>,
  ) {}

  async execute({ gameId, userId }: GetGameByIdCommand): Promise<ServiceResult<QuizGameViewModel>> {
    const res = new ServiceResult<QuizGameViewModel>();

    const gameCortege: GameViewAndPlayersIdCortege | null = await this.quizRepo.getGameAndPlayers(gameId);

    if (gameCortege == null) {
      res.addError({
        code: QuizResultError.QUIZ_GAME_NO_FOUND,
      });
      return res;
    }

    const [game, gameUsers] = gameCortege;

    if (!gameUsers.includes(userId)) {
      res.addError({
        code: QuizResultError.QUIZ_GAME_NO_PERMISSION,
      });
      return res;
    }

    res.setData(game);

    return res;
  }
}
