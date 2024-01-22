import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IQuizGamePlayer, IQuizGamePlayerAnswer, IQuizGamePlayerProgress, QuizGameAnswerStatus, QuizGameProgressStatus } from '../../types/dao';
import { QuizGamePlayerProgressCreateModel } from '../../types/dto';

@Schema({ timestamps: true })
export class QuizGamePlayerProgress implements IQuizGamePlayerProgress {
  @Prop({
    type: {
      playerId: { type: String, required: true },
      playerLogin: { type: String, required: true },
    },
  })
  player: IQuizGamePlayer;

  @Prop({
    type: [
      {
        questionId: { type: String, required: true },
        answerStatus: { type: Number, enum: QuizGameAnswerStatus },
        addedAt: { type: Date },
      },
    ],
    default: [],
  })
  answers: IQuizGamePlayerAnswer[];

  @Prop({ type: Number, default: 0 })
  score: number;

  @Prop()
  gameId: string;

  @Prop({ type: Number, enum: QuizGameProgressStatus, default: QuizGameProgressStatus.Active })
  status: QuizGameProgressStatus;

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: Date;

  setStatus(status: QuizGameProgressStatus) {
    this.status = status;
  }

  static createProgress(input: QuizGamePlayerProgressCreateModel, gameId: string) {
    const progress = new this();

    progress.player = {
      playerId: input.userId,
      playerLogin: input.userLogin,
    };

    progress.gameId = gameId;

    return progress;
  }
}

export const QuizGamePlayerProgressSchema = SchemaFactory.createForClass(QuizGamePlayerProgress);

QuizGamePlayerProgressSchema.methods = {
  setStatus: QuizGamePlayerProgress.prototype.setStatus,
};

QuizGamePlayerProgressSchema.statics = {
  createProgress: QuizGamePlayerProgress.createProgress,
};
