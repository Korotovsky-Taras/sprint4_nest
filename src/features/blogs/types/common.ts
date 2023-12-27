import { BlogPaginationQueryModel, BlogPaginationRepositoryModel, BlogViewModel } from './dto';
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

export interface IBlogsRepository<T> extends IRepository<T> {
  createBlog(input: BlogCreateDto): Promise<BlogViewModel>;
  updateBlogById(id: string, input: BlogUpdateDto): Promise<boolean>;
  deleteBlogById(id: string): Promise<boolean>;
  getBlogById(id: string): Promise<BlogViewModel | null>;
}

export const BlogQueryRepoKey = Symbol('BLOGS_QUERY_REPO');

export interface IBlogsQueryRepository {
  getBlogs(query: WithPaginationQuery & { searchNameTerm: string | null }): Promise<WithPagination<BlogViewModel>>;
  getBlogById(id: string): Promise<BlogViewModel | null>;
}

export interface IBlogDataMapper<T> {
  toBlogsView(items: T[]): BlogViewModel[];
  toBlogView(item: T): BlogViewModel;
  toRepoQuery(query: BlogPaginationQueryModel): BlogPaginationRepositoryModel;
}
