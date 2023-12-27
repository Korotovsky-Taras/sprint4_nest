import { PostPaginationQueryModel, PostPaginationRepositoryModel, PostViewModel } from '../../types/dto';
import { IPostSqlRaw } from '../../types/dao';
import { LastLike, LikesExtendedInfo, LikeStatus } from '../../../likes/types';
import { withExternalDirection, withExternalNumber, withExternalString } from '../../../../application/utils/withExternalQuery';
import { toIsoString } from '../../../../application/utils/date';

const initialQuery: PostPaginationRepositoryModel = {
  sortBy: 'createdAt',
  sortDirection: 'desc',
  pageNumber: 1,
  pageSize: 10,
};

export class PostsSqlOrmDataMapper {
  static toPostsView(items: IPostSqlRaw[]): PostViewModel[] {
    return items.map((item) => {
      return PostsSqlOrmDataMapper.toPostView(item);
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
      extendedLikesInfo: PostsSqlOrmDataMapper.toLikesInfo(item),
    };
  }

  static toRepoQuery(query: PostPaginationQueryModel): PostPaginationRepositoryModel {
    return {
      sortBy: withExternalString(initialQuery.sortBy, query.sortBy),
      sortDirection: withExternalDirection(initialQuery.sortDirection, query.sortDirection),
      pageNumber: withExternalNumber(initialQuery.pageNumber, query.pageNumber),
      pageSize: withExternalNumber(initialQuery.pageSize, query.pageSize),
    };
  }

  static toLikesInfo(model: IPostSqlRaw): LikesExtendedInfo {
    return {
      likesCount: model.likesInfo.likesCount,
      dislikesCount: model.likesInfo.dislikesCount,
      myStatus: PostsSqlOrmDataMapper.getMyStatus(model.likesInfo.myStatus),
      newestLikes: (model.lastLikes ?? []).map((lastLike: LastLike) => {
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
