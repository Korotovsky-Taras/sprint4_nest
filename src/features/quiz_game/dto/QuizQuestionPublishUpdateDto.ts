import { IsBoolean, IsNotEmpty } from 'class-validator';

export class QuizQuestionPublishUpdateDto {
  @IsNotEmpty()
  @IsBoolean()
  published: boolean;
}
