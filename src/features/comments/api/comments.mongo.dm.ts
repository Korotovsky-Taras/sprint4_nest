import { UserIdReq } from '../../../application/utils/types';
import { CommentViewModel } from '../types/dto';
import { toIsoString } from '../../../application/utils/date';
import { Like, LikeStatus } from '../../likes/types';
import { CommentMongoType } from '../types/dao';

export class CommentsMongoDataMapper {
  static toCommentView(comment: CommentMongoType, userId: UserIdReq): CommentViewModel {
    const myLike = comment.likes.find((like: Like) => like.userId === userId);
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: comment.commentatorInfo,
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
      return CommentsMongoDataMapper.toCommentView(comment, userId);
    });
  }
}
