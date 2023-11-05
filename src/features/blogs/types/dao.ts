import { WithId } from 'mongodb';
import { HydratedDocument, Model } from 'mongoose';
import { BlogCreateDto } from '../dto/BlogCreateDto';

export interface IBlog {
  name: string;
  description: string;
  websiteUrl: string;
  createdAt: Date;
  isMembership: boolean;
}

export type BlogDBType = WithId<IBlog>;

export type BlogDocumentType = HydratedDocument<IBlog, IBlogMethods>;

export interface IBlogMethods {}

export interface IBlogModel extends Model<BlogDocumentType, IBlogMethods> {
  createBlog(input: BlogCreateDto): BlogDocumentType;
}
