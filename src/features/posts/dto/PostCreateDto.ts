import { MaxLength } from 'class-validator';
import { IsNotEmptyString } from '../../../application/decorators/validation/IsNotEmptyString';
import { POST_CONTENT_MAX, POST_DESCRIPTION_MAX, POST_TITLE_MAX } from './dto.variables';
import { IsBlogExist } from '../../../application/decorators/validation/IsBlogExist';

export class PostCreateDto {
  @IsBlogExist()
  blogId: string;

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
