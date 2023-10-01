import { BlogPaginationQueryDto, BlogViewDto } from './dto';
import { BlogMongoType, IBlog } from './dao';
import { Request } from 'express';
import { PostPaginationQueryDto, PostViewDto } from '../../posts/types/dto';
import { IRepository, IService } from '../../types';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { UserIdReq, WithPagination, WithPaginationQuery } from '../../../application/utils/types';
import { BlogPostCreateDto } from '../dto/BlogPostCreateDto';
import { BlogCreateDto } from '../dto/BlogCreateDto';
import { BlogUpdateDto } from '../dto/BlogUpdateDto';

export type BlogMapperType<T> = (blog: BlogMongoType) => T;
export type BlogListMapperType<T> = (blog: BlogMongoType[]) => T[];

export interface IBlogService extends IService {
  createBlog(dto: BlogCreateDto): Promise<BlogViewDto>;
  createPost(userId: UserIdReq, blogId: string, dto: BlogPostCreateDto): Promise<ServiceResult<PostViewDto>>;
  updateBlogById(blogId: string, model: BlogUpdateDto): Promise<ServiceResult<boolean>>;
  deleteBlogById(blogId: string): Promise<ServiceResult<boolean>>;
}

export interface IBlogsController {
  getAll(query: BlogPaginationQueryDto): Promise<WithPagination<BlogViewDto>>;
  getBlog(blogId: string): Promise<BlogViewDto>;
  createBlog(input: BlogCreateDto): Promise<BlogViewDto>;
  getBlogPosts(blogId: string, query: PostPaginationQueryDto, req: Request): Promise<WithPagination<PostViewDto>>;
  createBlogPost(blogId: string, input: BlogPostCreateDto, req: Request): Promise<PostViewDto>;
  updateBlog(blogId: string, input: BlogUpdateDto): Promise<void>;
  deleteBlog(blogId: string): Promise<void>;
}

export interface IBlogsRepository extends IRepository<IBlog> {
  createBlog<T>(input: BlogCreateDto, mapper: BlogMapperType<T>): Promise<T>;
  updateBlogById(id: string, input: BlogUpdateDto): Promise<boolean>;
  deleteBlogById(id: string): Promise<boolean>;
}

export interface IBlogsQueryRepository {
  getBlogs<T>(query: WithPaginationQuery<IBlog> & { searchNameTerm: string | null }, mapper: BlogListMapperType<T>): Promise<WithPagination<T>>;
  getBlogById<T>(id: string, mapper: BlogMapperType<T>): Promise<T | null>;
}
