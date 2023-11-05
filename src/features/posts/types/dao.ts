import { HydratedDocument, Model } from 'mongoose';
import { WithId } from 'mongodb';
import { IWithLikes, LastLike, LikesInfo, LikeStatus } from '../../likes/types';
import { PostCreateModel } from './dto';

export interface IPost extends IWithLikes {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
}

export interface IPostSqlRaw {
  _id: number;
  title: string;
  shortDescription: string;
  content: string;
  blogId: number;
  blogName: string;
  likesInfo: LikesInfo & { myStatus: number | null };
  lastLikes: LastLike[];
  createdAt: Date;
}

export type PostDBType = WithId<IPost>;

export type PostDocumentType = HydratedDocument<IPost, IPostMethods>;

export interface IPostMethods {
  updateLike(userId: string, userLogin: string, likeStatus: LikeStatus);
}

export interface IPostModel extends Model<PostDocumentType, IPostMethods> {
  createPost(input: PostCreateModel): PostDocumentType;
}
