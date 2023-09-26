import { PostPaginationQueryDto, PostPaginationRepositoryDto, PostViewDto } from '../types/dto';
import { UserIdReq } from '../../../utils/types';
import { PostMongoType } from '../types/dao';
import { withExternalDirection, withExternalNumber, withExternalString } from '../../../utils/withExternalQuery';
import { toIsoString } from '../../../utils/date';
import { LastLike, Like, LikesExtendedInfo, LikeStatus } from '../../likes/types';

const initialQuery: PostPaginationRepositoryDto = {
  sortBy: 'createdAt',
  sortDirection: 'desc',
  pageNumber: 1,
  pageSize: 10,
};

export class PostsDataMapper {
  static toPostsView(items: PostMongoType[], userId: UserIdReq): PostViewDto[] {
    return items.map((item) => {
      return PostsDataMapper.toPostView(item, userId);
    });
  }

  static toPostView(item: PostMongoType, userId: UserIdReq): PostViewDto {
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
