import { PostPaginationQueryDto, PostPaginationRepositoryDto, PostViewModel } from '../types/dto';
import { PostMongoType } from '../types/dao';
import { LastLike, Like, LikesExtendedInfo, LikeStatus } from '../../likes/types';
import { withExternalDirection, withExternalNumber, withExternalString } from '../../../application/utils/withExternalQuery';
import { UserIdReq } from '../../../application/utils/types';
import { toIsoString } from '../../../application/utils/date';

const initialQuery: PostPaginationRepositoryDto = {
  sortBy: 'createdAt',
  sortDirection: 'desc',
  pageNumber: 1,
  pageSize: 10,
};

export class PostsDataMapper {
  static toPostsView(items: PostMongoType[], userId: UserIdReq): PostViewModel[] {
    return items.map((item) => {
      return PostsDataMapper.toPostView(item, userId);
    });
  }

  static toPostView(item: PostMongoType, userId: UserIdReq): PostViewModel {
    return {
      id: item._id.toString(),
      title: item.title,
      shortDescription: item.shortDescription,
      content: item.content,
      blogId: item.blogId,
      blogName: item.blogName,
      createdAt: toIsoString(item.createdAt),
      extendedLikesInfo: PostsDataMapper.toLikesInfo(item, userId),
    };
  }

  static toRepoQuery(query: PostPaginationQueryDto): PostPaginationRepositoryDto {
    return {
      sortBy: withExternalString(initialQuery.sortBy, query.sortBy),
      sortDirection: withExternalDirection(initialQuery.sortDirection, query.sortDirection),
      pageNumber: withExternalNumber(initialQuery.pageNumber, query.pageNumber),
      pageSize: withExternalNumber(initialQuery.pageSize, query.pageSize),
    };
  }

  static toLikesInfo(model: PostMongoType, userId: UserIdReq): LikesExtendedInfo {
    const myLike = model.likes.find((like: Like) => like.userId === userId);
    return {
      likesCount: model.likesInfo.likesCount,
      dislikesCount: model.likesInfo.dislikesCount,
      myStatus: myLike ? myLike.status : LikeStatus.NONE,
      newestLikes: model.lastLikes.map((lastLike: LastLike) => {
        return {
          login: lastLike.userLogin,
          userId: lastLike.userId,
          addedAt: lastLike.createdAt,
        };
      }),
    };
  }
}
