import { PostViewModel } from '../../types/dto';
import { IPostSqlRaw } from '../../types/dao';
import { LastLike, LikesExtendedInfo, LikeStatus } from '../../../likes/types';
import { toIsoString } from '../../../../application/utils/date';

export class PostsSqlRawDataMapper {
  static toPostsView(items: IPostSqlRaw[]): PostViewModel[] {
    return items.map((item) => {
      return PostsSqlRawDataMapper.toPostView(item);
    });
  }

  static toPostView(item: IPostSqlRaw): PostViewModel {
    return {
      id: String(item._id),
      title: item.title,
      shortDescription: item.shortDescription,
      content: item.content,
      blogId: String(item.blogId),
      blogName: item.blogName,
      createdAt: toIsoString(item.createdAt),
      extendedLikesInfo: PostsSqlRawDataMapper.toLikesInfo(item),
    };
  }

  static toLikesInfo(model: IPostSqlRaw): LikesExtendedInfo {
    return {
      likesCount: model.likesInfo.likesCount,
      dislikesCount: model.likesInfo.dislikesCount,
      myStatus: PostsSqlRawDataMapper.getMyStatus(model.likesInfo.myStatus),
      newestLikes: model.lastLikes.map((lastLike: LastLike) => {
        return {
          login: lastLike.userLogin,
          userId: String(lastLike.userId),
          addedAt: toIsoString(lastLike.createdAt),
        };
      }),
    };
  }

  static getMyStatus(status: number | null) {
    if (status === 0) {
      return LikeStatus.DISLIKE;
    }
    if (status === 1) {
      return LikeStatus.LIKE;
    }
    return LikeStatus.NONE;
  }
}
