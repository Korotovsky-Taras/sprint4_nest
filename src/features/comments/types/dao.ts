import { HydratedDocument, Model } from 'mongoose';
import { WithId } from 'mongodb';
import { CommentCreateDto } from './dto';
import { IWithLikes, LikeStatus } from '../../likes/types';

export interface IComment extends IWithLikes {
  postId: string;
  content: string;
  commentatorInfo: CommentCommentatorInfo;
  createdAt: Date;
}

export type CommentCommentatorInfo = {
  userId: string;
  userLogin: string;
};

export type CommentMongoType = WithId<IComment>;

export type CommentDocumentType = HydratedDocument<IComment, ICommentMethods>;

export interface ICommentMethods {
  updateLike(userId: string, userLogin: string, likeStatus: LikeStatus);
}

export interface ICommentModel extends Model<CommentDocumentType, ICommentMethods> {
  createComment(input: CommentCreateDto): CommentDocumentType;
}
