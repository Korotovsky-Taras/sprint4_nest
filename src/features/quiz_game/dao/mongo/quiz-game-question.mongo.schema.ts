import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IQuizGameQuestion } from '../../types/dao';
import { QuizGameQuestionCreateModel } from '../../types/dto';

@Schema({ timestamps: true })
export class QuizGameQuestion implements IQuizGameQuestion {
  constructor(input: QuizGameQuestionCreateModel) {
    this.body = input.body;
    this.correctAnswers = input.correctAnswers;
    this.published = input.published;
  }

  @Prop({ required: true })
  body: string;

  @Prop({ required: true })
  correctAnswers: string[];

  @Prop()
  published: boolean;

  createdAt: Date;
  updatedAt: Date;

  static createQuestion(input: QuizGameQuestionCreateModel) {
    return new this(input);
  }
}

export const QuizGameQuestionSchema = SchemaFactory.createForClass(QuizGameQuestion);

QuizGameQuestionSchema.methods = {};

QuizGameQuestionSchema.statics = {
  createQuestion: QuizGameQuestion.createQuestion,
};
