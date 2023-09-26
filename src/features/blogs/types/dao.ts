import { WithId } from 'mongodb';
import { BlogCreateDto } from './dto';
import { HydratedDocument, Model } from 'mongoose';

export interface IBlog {
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
}

export type BlogMongoType = WithId<IBlog>;

export type BlogDocumentType = HydratedDocument<IBlog, IBlogMethods>;

export interface IBlogMethods {}

export interface IBlogModel extends Model<BlogDocumentType, IBlogMethods> {
  createBlog(input: BlogCreateDto): BlogDocumentType;
}
