import { Matches, MaxLength } from 'class-validator';
import { IsNotEmptyString } from '../../../application/decorators/validation/IsNotEmptyString';
import { BLOG_DESCRIPTION_MAX, BLOG_NAME_MAX, BLOG_WEB_URL_MATCH, BLOG_WEB_URL_MAX } from './dto.variables';

export class BlogCreateDto {
  @IsNotEmptyString()
  @MaxLength(BLOG_NAME_MAX)
  name: string;

  @IsNotEmptyString()
  @MaxLength(BLOG_DESCRIPTION_MAX)
  description: string;

  @IsNotEmptyString()
  @MaxLength(BLOG_WEB_URL_MAX)
  @Matches(BLOG_WEB_URL_MATCH)
  websiteUrl: string;
}
