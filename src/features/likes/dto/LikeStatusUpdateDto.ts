import { IsEnum } from 'class-validator';
import { LikeStatus } from '../types';

export class LikeStatusUpdateDto {
  @IsEnum(LikeStatus)
  likeStatus: LikeStatus;
}
