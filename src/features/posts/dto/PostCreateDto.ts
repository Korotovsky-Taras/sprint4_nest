import { MaxLength } from 'class-validator';
import { IsNotEmptyString } from '../../../application/decorators/validation/IsNotEmptyString';
import { CONTENT_MAX, POST_TITLE_MAX, SHORT_DESCRIPTION_MAX } from './dto.variables';
import { IsBlogExist } from '../../../application/decorators/validation/IsBlogExist';

export class PostCreateDto {
  @IsBlogExist()
  blogId: string;

  @IsNotEmptyString()
  @MaxLength(POST_TITLE_MAX)
  title: string;

  @IsNotEmptyString()
  @MaxLength(SHORT_DESCRIPTION_MAX)
  shortDescription: string;

  @IsNotEmptyString()
  @MaxLength(CONTENT_MAX)
  content: string;
}
