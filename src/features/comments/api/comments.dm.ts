import { CommentMongoType } from '../types/dao';
import { UserIdReq } from '../../../application/utils/types';
import { CommentPaginationQueryDto, CommentPaginationRepositoryDto, CommentViewModel } from '../types/dto';
import { toIsoString } from '../../../application/utils/date';
import { withExternalDirection, withExternalNumber, withExternalString } from '../../../application/utils/withExternalQuery';
import { Like, LikeStatus } from '../../likes/types';

const initialQuery: CommentPaginationRepositoryDto = {
  sortBy: 'createdAt',
  sortDirection: 'desc',
  pageNumber: 1,
  pageSize: 10,
};

export class CommentsDataMapper {
  static toCommentView(comment: CommentMongoType, userId: UserIdReq): CommentViewModel {
    const myLike = comment.likes.find((like: Like) => like.userId === userId);
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: comment.commentatorInfo.userId,
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: toIsoString(comment.createdAt),
      likesInfo: {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
        myStatus: myLike ? myLike.status : LikeStatus.NONE,
      },
    };
  }

  static toCommentsView(list: CommentMongoType[], userId: UserIdReq): CommentViewModel[] {
    return list.map((comment) => {
      return CommentsDataMapper.toCommentView(comment, userId);
    });
  }

  static toRepoQuery(query: CommentPaginationQueryDto): CommentPaginationRepositoryDto {
    return {
      sortBy: withExternalString(initialQuery.sortBy, query.sortBy),
      sortDirection: withExternalDirection(initialQuery.sortDirection, query.sortDirection),
      pageNumber: withExternalNumber(initialQuery.pageNumber, query.pageNumber),
      pageSize: withExternalNumber(initialQuery.pageSize, query.pageSize),
    };
  }
}