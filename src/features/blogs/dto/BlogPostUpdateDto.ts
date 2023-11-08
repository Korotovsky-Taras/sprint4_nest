import { MaxLength } from 'class-validator';
import { IsNotEmptyString } from '../../../application/decorators/validation/IsNotEmptyString';
import { POST_CONTENT_MAX, POST_DESCRIPTION_MAX, POST_TITLE_MAX } from '../../posts/dto/dto.variables';

export class BlogPostUpdateDto {
  @IsNotEmptyString()
  @MaxLength(POST_TITLE_MAX)
  title: string;

  @IsNotEmptyString()
  @MaxLength(POST_DESCRIPTION_MAX)
  shortDescription: string;

  @IsNotEmptyString()
  @MaxLength(POST_CONTENT_MAX)
  content: string;
}
