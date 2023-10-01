import { PostCreateModel, PostLikeStatusInputModel, PostPaginationRepositoryDto, PostViewDto } from './dto';
import { IPost, PostMongoType } from './dao';
import { IRepository, IService } from '../../types';
import { Request } from 'express';
import { CommentViewDto } from '../../comments/types/dto';
import { IComment } from '../../comments/types/dao';
import { PaginationQueryModel, UserIdReq, WithPagination } from '../../../application/utils/types';
import { PostCreateDto } from '../dto/PostCreateDto';
import { PostUpdateDto } from '../dto/PostUpdateDto';
import { PostCommentCreateDto } from '../dto/PostCommentCreateDto';
import { ServiceResult } from '../../../application/core/ServiceResult';

export type PostMapperType<T> = (post: PostMongoType, userId: UserIdReq) => T;
export type PostListMapperType<T> = (post: PostMongoType[], userId: UserIdReq) => T[];

export interface IPostsService extends IService {
  createPost(userId: UserIdReq, model: PostCreateDto): Promise<PostViewDto | null>;
  updatePostById(blogId: string, model: PostUpdateDto): Promise<boolean>;
  updateLikeStatus(input: PostLikeStatusInputModel): Promise<ServiceResult>;
  deletePostById(blogId: string): Promise<boolean>;
}

export interface IPostsController {
  getAll(query: PaginationQueryModel<IPost>, req: Request): Promise<WithPagination<PostViewDto>>;
  getPost(postId: string, req: Request): Promise<PostViewDto>;
  createPost(input: PostCreateDto, req: Request): Promise<PostViewDto>;
  updatePost(postId: string, input: PostUpdateDto): Promise<void>;
  deletePost(postId: string): Promise<void>;
  getComments(postId: string, query: PaginationQueryModel<IComment>, req: Request): Promise<WithPagination<CommentViewDto>>;
  createComment(postId: string, input: PostCommentCreateDto, req: Request): Promise<CommentViewDto>;
}

export interface IPostsRepository extends IRepository<IPost> {
  createPost<T>(userId: string | null, input: PostCreateModel, mapper: PostMapperType<T>): Promise<T>;
  updatePostById(id: string, input: PostUpdateDto): Promise<boolean>;
  deletePostById(id: string): Promise<boolean>;
}

export interface IPostsQueryRepository {
  getPosts<T>(
    userId: string | null,
    filter: Partial<PostMongoType>,
    query: PostPaginationRepositoryDto,
    mapper: PostListMapperType<T>,
  ): Promise<WithPagination<T>>;
  getPostById<T>(userId: UserIdReq, id: string, mapper: PostMapperType<T>): Promise<T | null>;
  isPostExist(id: string): Promise<boolean>;
}
