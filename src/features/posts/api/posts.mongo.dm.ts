import { PostPaginationQueryModel, PostPaginationRepositoryModel, PostViewModel } from '../types/dto';
import { PostDBType } from '../types/dao';
import { LastLike, Like, LikesExtendedInfo, LikeStatus } from '../../likes/types';
import { withExternalDirection, withExternalNumber, withExternalString } from '../../../application/utils/withExternalQuery';
import { UserIdReq } from '../../../application/utils/types';
import { toIsoString } from '../../../application/utils/date';

const initialQuery: PostPaginationRepositoryModel = {
  sortBy: 'createdAt',
  sortDirection: 'desc',
  pageNumber: 1,
  pageSize: 10,
};

export class PostsMongoDataMapper {
  static toPostsView(items: PostDBType[], userId: UserIdReq): PostViewModel[] {
    return items.map((item) => {
      return PostsMongoDataMapper.toPostView(item, userId);
    });
  }

  static toPostView(item: PostDBType, userId: UserIdReq): PostViewModel {
    return {
      id: item._id.toString(),
      title: item.title,
      shortDescription: item.shortDescription,
      content: item.content,
      blogId: item.blogId,
      blogName: item.blogName,
      createdAt: toIsoString(item.createdAt),
      extendedLikesInfo: PostsMongoDataMapper.toLikesInfo(item, userId),
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

  static toLikesInfo(model: PostDBType, userId: UserIdReq): LikesExtendedInfo {
    const myLike = model.likes.find((like: Like) => like.userId === userId);
    return {
      likesCount: model.likesInfo.likesCount,
      dislikesCount: model.likesInfo.dislikesCount,
      myStatus: myLike ? myLike.status : LikeStatus.NONE,
      newestLikes: model.lastLikes.map((lastLike: LastLike) => {
        return {
          login: lastLike.userLogin,
          userId: lastLike.userId,
          addedAt: toIsoString(lastLike.createdAt),
        };
      }),
    };
  }
}
