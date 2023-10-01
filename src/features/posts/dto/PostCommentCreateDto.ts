import { MaxLength, MinLength } from 'class-validator';
import { IsNotEmptyString } from '../../../application/decorators/validation/IsNotEmptyString';
import { COMMENT_CONTENT_MAX, COMMENT_CONTENT_MIN } from './dto.variables';

export class PostCommentCreateDto {
  @IsNotEmptyString()
  @MinLength(COMMENT_CONTENT_MIN)
  @MaxLength(COMMENT_CONTENT_MAX)
  content: string;
}
