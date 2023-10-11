import { BlogPaginationQueryModel, BlogViewModel } from './dto';
import { BlogMongoType, IBlog } from './dao';
import { Request } from 'express';
import { PostPaginationQueryModel, PostViewModel } from '../../posts/types/dto';
import { IRepository, IService } from '../../types';
import { WithPagination, WithPaginationQuery } from '../../../application/utils/types';
import { BlogPostCreateDto } from '../dto/BlogPostCreateDto';
import { BlogCreateDto } from '../dto/BlogCreateDto';
import { BlogUpdateDto } from '../dto/BlogUpdateDto';

export type BlogMapperType<T> = (blog: BlogMongoType) => T;
export type BlogListMapperType<T> = (blog: BlogMongoType[]) => T[];

export interface IBlogService extends IService {}

export interface IBlogsController {
  getAll(query: BlogPaginationQueryModel): Promise<WithPagination<BlogViewModel>>;
  getBlog(blogId: string): Promise<BlogViewModel>;
  createBlog(input: BlogCreateDto): Promise<BlogViewModel | null>;
  getBlogPosts(blogId: string, query: PostPaginationQueryModel, req: Request): Promise<WithPagination<PostViewModel>>;
  createBlogPost(blogId: string, input: BlogPostCreateDto, req: Request): Promise<PostViewModel>;
  updateBlog(blogId: string, input: BlogUpdateDto): Promise<void>;
  deleteBlog(blogId: string): Promise<void>;
}

export interface IBlogsRepository extends IRepository<IBlog> {
  createBlog<T>(input: BlogCreateDto, mapper: BlogMapperType<T>): Promise<T>;
  updateBlogById(id: string, input: BlogUpdateDto): Promise<boolean>;
  deleteBlogById(id: string): Promise<boolean>;
  getBlogById(id: string): Promise<BlogMongoType | null>;
}

export interface IBlogsQueryRepository {
  getBlogs<T>(query: WithPaginationQuery<IBlog> & { searchNameTerm: string | null }, mapper: BlogListMapperType<T>): Promise<WithPagination<T>>;
  getBlogById<T>(id: string, mapper: BlogMapperType<T>): Promise<T | null>;
}
