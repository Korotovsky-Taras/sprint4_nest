import { CommentViewModel } from '../../types/dto';
import { toIsoString } from '../../../../application/utils/date';
import { LikeStatus } from '../../../likes/types';
import { ICommentSqlRaw } from '../../types/dao';

export class CommentsSqlRawDataMapper {
  static toCommentView(comment: ICommentSqlRaw): CommentViewModel {
    return {
      id: comment._id.toString(),
      content: comment.content,
      commentatorInfo: {
        userId: String(comment.commentatorInfo.userId),
        userLogin: comment.commentatorInfo.userLogin,
      },
      createdAt: toIsoString(comment.createdAt),
      likesInfo: {
        likesCount: comment.likesInfo.likesCount,
        dislikesCount: comment.likesInfo.dislikesCount,
        myStatus: CommentsSqlRawDataMapper.getMyStatus(comment.likesInfo.myStatus),
      },
    };
  }

  static toCommentsView(list: ICommentSqlRaw[]): CommentViewModel[] {
    return list.map((comment) => {
      return CommentsSqlRawDataMapper.toCommentView(comment);
    });
  }

  static getMyStatus(status: number) {
    if (status === 0) {
      return LikeStatus.DISLIKE;
    }
    if (status === 1) {
      return LikeStatus.LIKE;
    }
    return LikeStatus.NONE;
  }
}
