import { Body, Controller, ForbiddenException, Get, HttpCode, Inject, NotFoundException, Post, UseGuards } from '@nestjs/common';
import { ParamId } from '../../../application/decorators/params/getParamNumberId';
import { AuthTokenGuard } from '../../../application/guards/AuthTokenGuard';
import { GetUserId } from '../../../application/decorators/params/getUserId';
import { QuizAnswerDto } from '../dto/QuizAnswerDto';
import { IQuizGameController, IQuizGameQueryRepository, QuizGameQueryRepoKey } from '../types/common';
import { CommandBus } from '@nestjs/cqrs';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { QuizResultError } from '../types/errors';
import { CreateQuizConnectionCommand } from '../use-cases/create-quiz-connection.case';
import { Status } from '../../../application/utils/types';
import { QuizGameAnswerViewModel, QuizGameViewModel } from '../types/dto';
import { GetMyCurrentGameCommand } from '../use-cases/get-my-current-game.case';
import { SetMyCurrentGameAnswerCommand } from '../use-cases/set-my-current-game-answer.case';
import { GetGameByIdCommand } from '../use-cases/get-game-by-id.case';

@Controller('pair-game-quiz/pairs')
@UseGuards(AuthTokenGuard)
export class QuizGameController implements IQuizGameController {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject(QuizGameQueryRepoKey) private readonly quizGameQueryRepo: IQuizGameQueryRepository,
  ) {}

  @Get('/my-current')
  @HttpCode(Status.OK)
  async getMyCurrentGame(@GetUserId() userId: string): Promise<QuizGameViewModel> {
    const res = await this.commandBus.execute<GetMyCurrentGameCommand, ServiceResult<QuizGameViewModel>>(new GetMyCurrentGameCommand(userId));

    if (res.hasErrorCode(QuizResultError.QUIZ_GAME_NO_FOUND)) {
      throw new NotFoundException();
    }

    return res.getData();
  }

  @Get('/:gameId')
  @HttpCode(Status.OK)
  async getGame(@ParamId('gameId') gameId: string, @GetUserId() userId: string): Promise<QuizGameViewModel> {
    const res = await this.commandBus.execute<GetGameByIdCommand, ServiceResult<QuizGameViewModel>>(new GetGameByIdCommand(gameId, userId));

    if (res.hasErrorCode(QuizResultError.QUIZ_GAME_NO_FOUND)) {
      throw new NotFoundException();
    }
    if (res.hasErrorCode(QuizResultError.QUIZ_GAME_NO_PERMISSION)) {
      throw new ForbiddenException();
    }

    return res.getData();
  }

  @Post('/my-current/answers')
  @HttpCode(Status.OK)
  async sendAnswer(@GetUserId() userId: string, @Body() dto: QuizAnswerDto): Promise<QuizGameAnswerViewModel> {
    const res = await this.commandBus.execute<SetMyCurrentGameAnswerCommand, ServiceResult<QuizGameAnswerViewModel>>(
      new SetMyCurrentGameAnswerCommand(userId, dto),
    );

    if (res.hasErrorCode(QuizResultError.QUIZ_GAME_NO_PERMISSION)) {
      throw new ForbiddenException();
    }

    return res.getData();
  }

  @Post('/connection')
  @HttpCode(Status.OK)
  async createConnection(@GetUserId() userId: string) {
    const res = await this.commandBus.execute<CreateQuizConnectionCommand, ServiceResult>(new CreateQuizConnectionCommand(userId));

    if (res.hasErrorCode(QuizResultError.QUIZ_GAME_NO_PERMISSION)) {
      throw new ForbiddenException();
    }

    return res.getData();
  }
}
