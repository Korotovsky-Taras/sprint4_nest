import { Body, Controller, Delete, Get, HttpCode, Inject, NotFoundException, Post, Put, Query, UseGuards } from '@nestjs/common';
import { ParamId } from '../../../application/decorators/params/getParamNumberId';
import { AuthBasicGuard } from '../../../application/guards/AuthBasicGuard';
import { IQuizGameQueryRepository, IQuizGameRepository, IQuizGameSaController, QuizGameQueryRepoKey, QuizGameRepoKey } from '../types/common';
import { QuizQuestionUpdateDto } from '../dto/QuizQuestionUpdateDto';
import { QuizQuestionPublishUpdateDto } from '../dto/QuizQuestionPublishUpdateDto';
import { Promise } from 'mongoose';
import { Status, WithPagination } from '../../../application/utils/types';
import { QuizPaginationQueryDto } from '../dto/QuizPaginationQueryDto';
import { QuizGameQuestionViewModel } from '../types/dto';
import { CommandBus } from '@nestjs/cqrs';
import { CreateQuizQuestionCommand } from '../use-cases/create-quiz-question.case';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { QuizQuestionCreateDto } from '../dto/QuizQuestionCreateDto';
import { DeleteQuizQuestionCommand } from '../use-cases/delete-quiz-question.case';
import { QuizResultError } from '../types/errors';
import { UpdateQuizQuestionCommand } from '../use-cases/update-quiz-question.case';
import { UpdateQuizQuestionPublishCommand } from '../use-cases/update-quiz-question-publish.case';

@Controller('sa/quiz/questions')
@UseGuards(AuthBasicGuard)
export class QuizGameAdminController implements IQuizGameSaController {
  constructor(
    private readonly commandBus: CommandBus,
    @Inject(QuizGameRepoKey) private readonly quizGameRepo: IQuizGameRepository<any>,
    @Inject(QuizGameQueryRepoKey) private readonly quizGameQueryRepo: IQuizGameQueryRepository,
  ) {}

  @Get()
  @HttpCode(Status.OK)
  async getAllQuestions(@Query() query: QuizPaginationQueryDto): Promise<WithPagination<QuizGameQuestionViewModel>> {
    return await this.quizGameQueryRepo.getAllQuestions(query);
  }

  @Get('/:id')
  @HttpCode(Status.OK)
  async getQuestion(@ParamId('id') id: string): Promise<QuizGameQuestionViewModel> {
    const question: QuizGameQuestionViewModel | null = await this.quizGameQueryRepo.getQuestionById(id);
    if (question == null) {
      throw new NotFoundException();
    }
    return question;
  }

  @Post()
  @HttpCode(Status.CREATED)
  async createQuestion(@Body() dto: QuizQuestionCreateDto): Promise<QuizGameQuestionViewModel> {
    return await this.commandBus.execute<CreateQuizQuestionCommand, QuizGameQuestionViewModel>(new CreateQuizQuestionCommand(dto));
  }

  @Delete('/:id')
  @HttpCode(Status.NO_CONTENT)
  async deleteQuestion(@ParamId('id') id: string) {
    const res = await this.commandBus.execute<DeleteQuizQuestionCommand, ServiceResult>(new DeleteQuizQuestionCommand(id));
    if (res.hasErrorCode(QuizResultError.QUIZ_QUESTION_NOT_FOUND)) {
      throw new NotFoundException();
    }
  }

  @Put('/:id')
  @HttpCode(Status.NO_CONTENT)
  async updateQuestion(@ParamId('id') id: string, @Body() dto: QuizQuestionUpdateDto) {
    const res = await this.commandBus.execute<UpdateQuizQuestionCommand, ServiceResult>(new UpdateQuizQuestionCommand(id, dto));
    if (res.hasErrorCode(QuizResultError.QUIZ_QUESTION_NOT_FOUND)) {
      throw new NotFoundException();
    }
  }

  @Put('/:id/publish')
  @HttpCode(Status.NO_CONTENT)
  async updateQuestionPublish(@ParamId('id') id: string, @Body() dto: QuizQuestionPublishUpdateDto) {
    const res = await this.commandBus.execute<UpdateQuizQuestionPublishCommand, ServiceResult>(new UpdateQuizQuestionPublishCommand(id, dto));
    if (res.hasErrorCode(QuizResultError.QUIZ_QUESTION_NOT_FOUND)) {
      throw new NotFoundException();
    }
  }
}
