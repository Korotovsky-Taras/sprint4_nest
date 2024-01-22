import { IsNotEmptyString } from '../../../application/decorators/validation/IsNotEmptyString';

export class QuizAnswerDto {
  @IsNotEmptyString()
  answer: string;
}
