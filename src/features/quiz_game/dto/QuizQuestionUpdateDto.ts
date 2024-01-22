import { IsNotEmptyString } from '../../../application/decorators/validation/IsNotEmptyString';
import { ArrayMinSize, IsArray, MaxLength, MinLength } from 'class-validator';
import { QUIZ_BODY_MAX, QUIZ_BODY_MIN } from './dto.variables';

export class QuizQuestionUpdateDto {
  @IsNotEmptyString()
  @MinLength(QUIZ_BODY_MIN)
  @MaxLength(QUIZ_BODY_MAX)
  body: string;

  @IsArray()
  @ArrayMinSize(1)
  correctAnswers: any[];
}
