import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { IQuizGameRepository, QuizGameRepoKey } from '../types/common';
import { Inject } from '@nestjs/common';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { QuizResultError } from '../types/errors';
import { QuizGameViewModel } from '../types/dto';
import { IUsersRepository, UserRepoKey } from '../../users/types/common';
import { UserEntityRepo } from '../../users/dao/user-entity.repo';

export class CreateQuizConnectionCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(CreateQuizConnectionCommand)
export class CreateQuizConnectionCase implements ICommandHandler<CreateQuizConnectionCommand> {
  constructor(
    @Inject(UserRepoKey) private readonly userRepo: IUsersRepository<any>,
    @Inject(QuizGameRepoKey) private readonly quizRepo: IQuizGameRepository<any>,
  ) {}

  async execute({ userId }: CreateQuizConnectionCommand): Promise<ServiceResult<QuizGameViewModel>> {
    const res = new ServiceResult<QuizGameViewModel>();

    //проверить является ли игрок участником какой-либо не завершенной игры
    const isUserInActiveGame: boolean = await this.quizRepo.isUserInActiveGame(userId);
    if (isUserInActiveGame) {
      //если является выкинуть 403 ошибку
      res.addError({
        code: QuizResultError.QUIZ_GAME_NO_PERMISSION,
      });
      return res;
    }

    //найти игру, ожидающую второго игрока
    const gameId: string | null = await this.quizRepo.getAwaitedGameId();
    const user: UserEntityRepo | null = await this.userRepo.getUserById(userId);

    if (user == null) {
      res.addError({
        code: QuizResultError.QUIZ_GAME_NO_PERMISSION,
      });
      return res;
    }

    //если такая есть – то присоединить текущего игрока к игре
    if (gameId) {
      const game: QuizGameViewModel | null = await this.quizRepo.connectToGame(gameId, {
        userLogin: user.login,
        userId: userId,
      });

      if (game == null) {
        res.addError({
          code: QuizResultError.QUIZ_CONNECTION_ERROR,
        });
        return res;
      }

      res.setData(game);
      return res;
    }

    // иначе создать игру с текущим игроком
    const game: QuizGameViewModel | null = await this.quizRepo.createNewGame({
      userLogin: user.login,
      userId: userId,
    });

    if (game == null) {
      res.addError({
        code: QuizResultError.QUIZ_CREATION_GAME_ERROR,
      });
      return res;
    }

    res.setData(game);
    return res;
  }
}
