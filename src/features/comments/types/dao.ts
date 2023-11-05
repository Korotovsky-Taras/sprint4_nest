import { HydratedDocument, Model } from 'mongoose';
import { WithId } from 'mongodb';
import { CommentCreateModel } from './dto';
import { IWithLikes, LikesInfo, LikeStatus } from '../../likes/types';

export interface IComment extends IWithLikes {
  postId: string;
  content: string;
  commentatorInfo: CommentCommentatorInfo;
  createdAt: Date;
}

export interface ICommentSqlRaw {
  _id: number;
  postId: number;
  content: string;
  commentatorInfo: CommentCommentatorInfo;
  likesInfo: LikesInfo & { myStatus: number };
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
  getUserStatus(userId: string): LikeStatus;
}

export interface ICommentModel extends Model<CommentDocumentType, ICommentMethods> {
  createComment(input: CommentCreateModel): CommentDocumentType;
}
