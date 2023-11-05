import { Prop, Schema } from '@nestjs/mongoose';
import { Like, LikeStatus } from './types';

@Schema()
export class WithLikes {
  @Prop({
    type: [
      {
        userId: { type: String, required: true },
        status: { type: String, enum: LikeStatus, required: true },
        createdAt: { type: Date, required: true },
      },
    ],
    default: [],
  })
  likes: {
    userId: string;
    status: LikeStatus;
    createdAt: Date;
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
        createdAt: { type: Date, required: true },
      },
    ],
    default: [],
  })
  lastLikes: {
    userId: string;
    userLogin: string;
    createdAt: Date;
  }[];

  getUserStatus(userId: string): LikeStatus {
    const myLike: Like | undefined = this.likes.find((like: Like) => like.userId === userId);
    return myLike ? myLike.status : LikeStatus.NONE;
  }

  updateLike(userId: string, userLogin: string, likeStatus: LikeStatus) {
    // Обновляем или устанавливаем лайк
    const likeIndex = this.likes.findIndex((like: Like) => like.userId === userId);
    const likeCreatedAt = new Date();
    if (likeIndex >= 0) {
      this.likes[likeIndex].status = likeStatus;
      this.likes[likeIndex].createdAt = likeCreatedAt;
    } else {
      this.likes.push({
        userId: userId,
        status: likeStatus,
        createdAt: likeCreatedAt,
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

    //Обновляем список последних лайков
    const lastLikesIds = this.lastLikes.map((like) => like.userId);
    if (lastLikesIds.includes(userId) && likeStatus === LikeStatus.DISLIKE) {
      this.lastLikes = this.lastLikes.filter((like) => like.userId != userId);
    } else if (likeStatus === LikeStatus.LIKE && !lastLikesIds.includes(userId)) {
      this.lastLikes.unshift({
        userId: userId,
        userLogin: userLogin,
        createdAt: likeCreatedAt,
      });
      if (this.lastLikes.length > 3) {
        this.lastLikes.length = 3;
      }
    }
  }
}
