import { HydratedDocument, Model } from 'mongoose';
import { WithId } from 'mongodb';
import { IWithLikes, LikeStatus } from '../../likes/types';
import { PostCreateModel } from './dto';

export interface IPost extends IWithLikes {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
}

export type PostMongoType = WithId<IPost>;

export type PostDocumentType = HydratedDocument<IPost, IPostMethods>;

export interface IPostMethods {
  updateLike(userId: string, userLogin: string, likeStatus: LikeStatus);
}

export interface IPostModel extends Model<PostDocumentType, IPostMethods> {
  createPost(input: PostCreateModel): PostDocumentType;
}
