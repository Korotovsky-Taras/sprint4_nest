import { BlogViewModel } from './dto';
import { BlogDBType, IBlog } from './dao';
import { Request } from 'express';
import { PostViewModel } from '../../posts/types/dto';
import { IRepository, IService } from '../../types';
import { WithPagination, WithPaginationQuery } from '../../../application/utils/types';
import { BlogPostCreateDto } from '../dto/BlogPostCreateDto';
import { BlogCreateDto } from '../dto/BlogCreateDto';
import { BlogUpdateDto } from '../dto/BlogUpdateDto';
import { BlogPaginationQueryDto } from '../dto/BlogPaginationQueryDto';
import { PostPaginationQueryDto } from '../../posts/dto/PostPaginationQueryDto';
import { BlogPostUpdateDto } from '../dto/BlogPostUpdateDto';

export type BlogMapperType<T> = (blog: BlogDBType) => T;
export type BlogListMapperType<T> = (blog: BlogDBType[]) => T[];

export interface IBlogService extends IService {}

export interface IBlogsController {
  getAll(query: BlogPaginationQueryDto): Promise<WithPagination<BlogViewModel>>;
  getBlog(blogId: string): Promise<BlogViewModel>;
  getBlogPosts(blogId: string, query: PostPaginationQueryDto, req: Request): Promise<WithPagination<PostViewModel>>;
}

export interface IBlogsAdminController {
  getAll(query: BlogPaginationQueryDto): Promise<WithPagination<BlogViewModel>>;
  createBlog(input: BlogCreateDto): Promise<BlogViewModel | null>;
  updateBlog(blogId: string, input: BlogUpdateDto): Promise<void>;
  deleteBlog(blogId: string): Promise<void>;
  getBlogPosts(blogId: string, query: PostPaginationQueryDto, req: Request): Promise<WithPagination<PostViewModel>>;
  createBlogPost(blogId: string, input: BlogPostCreateDto, req: Request): Promise<PostViewModel>;
  updateBlogPost(blogId: string, postId: string, dto: BlogPostUpdateDto): Promise<void>;
  deleteBlogPost(blogId: string, postId: string): Promise<void>;
}

export const BlogRepoKey = Symbol('BLOGS_REPO');

export interface IBlogsRepository extends IRepository<IBlog> {
  createBlog<T>(input: BlogCreateDto, mapper: BlogMapperType<T>): Promise<T>;
  updateBlogById(id: string, input: BlogUpdateDto): Promise<boolean>;
  deleteBlogById(id: string): Promise<boolean>;
  getBlogById(id: string): Promise<BlogDBType | null>;
}

export const BlogQueryRepoKey = Symbol('BLOGS_QUERY_REPO');

export interface IBlogsQueryRepository {
  getBlogs<T>(query: WithPaginationQuery & { searchNameTerm: string | null }, mapper: BlogListMapperType<T>): Promise<WithPagination<T>>;
  getBlogById<T>(id: string, mapper: BlogMapperType<T>): Promise<T | null>;
}
