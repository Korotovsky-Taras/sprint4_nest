import { Prop, Schema } from '@nestjs/mongoose';
import { Like, LikeStatus } from './types';
import { toIsoString } from '../../application/utils/date';

@Schema()
export class WithLikes {
  @Prop({
    type: [
      {
        userId: { type: String, required: true },
        status: { type: String, enum: LikeStatus, required: true },
        createdAt: { type: String, required: true },
      },
    ],
    default: [],
  })
  likes: {
    userId: string;
    status: LikeStatus;
    createdAt: string;
  }[];

  @Prop({
    type: {
      likesCount: { type: Number, required: true, default: 0 },
      dislikesCount: { type: Number, required: true, default: 0 },
    },
    default: { likesCount: 0, dislikesCount: 0 },
  })
  likesInfo: {
    likesCount: number;
    dislikesCount: number;
  };

  @Prop({
    type: [
      {
        userId: { type: String, required: true },
        userLogin: { type: String, required: true },
        createdAt: { type: String, required: true },
      },
    ],
    default: [],
  })
  lastLikes: {
    userId: string;
    userLogin: string;
    createdAt: string;
  }[];

  updateLike(userId: string, likeStatus: LikeStatus) {
    // Обновляем или устанавливаем лайк
    const likeIndex = this.likes.findIndex((like: Like) => like.userId === userId);
    if (likeIndex >= 0) {
      this.likes[likeIndex].status = likeStatus;
      this.likes[likeIndex].createdAt = toIsoString(new Date());
    } else {
      this.likes.push({
        userId: userId,
        status: likeStatus,
        createdAt: toIsoString(new Date()),
      });
    }

    // Обновляем статистику лайков
    this.likesInfo.likesCount = 0;
    this.likesInfo.dislikesCount = 0;
    this.likes.forEach((like: Like) => {
      if (like.status === LikeStatus.LIKE) {
        this.likesInfo.likesCount++;
      }
      if (like.status === LikeStatus.DISLIKE) {
        this.likesInfo.dislikesCount++;
      }
    });
  }
}
