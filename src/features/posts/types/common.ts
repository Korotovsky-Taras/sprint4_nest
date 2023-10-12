import { PostCreateModel, PostPaginationRepositoryModel, PostViewModel } from './dto';
import { IPost, PostMongoType } from './dao';
import { IRepository, IService } from '../../types';
import { Request } from 'express';
import { CommentViewModel } from '../../comments/types/dto';
import { IComment } from '../../comments/types/dao';
import { PaginationQueryModel, UserIdReq, WithPagination } from '../../../application/utils/types';
import { PostCreateDto } from '../dto/PostCreateDto';
import { PostUpdateDto } from '../dto/PostUpdateDto';
import { PostCommentCreateDto } from '../dto/PostCommentCreateDto';
import { LikeStatus } from '../../likes/types';

export type PostMapperType<T> = (post: PostMongoType, userId: UserIdReq) => T;
export type PostListMapperType<T> = (post: PostMongoType[], userId: UserIdReq) => T[];

export interface IPostsService extends IService {}

export interface IPostsController {
  getAll(query: PaginationQueryModel<IPost>, req: Request): Promise<WithPagination<PostViewModel>>;
  getPost(postId: string, req: Request): Promise<PostViewModel>;
  createPost(input: PostCreateDto, req: Request): Promise<PostViewModel>;
  updatePost(postId: string, input: PostUpdateDto): Promise<void>;
  deletePost(postId: string): Promise<void>;
  getComments(postId: string, query: PaginationQueryModel<IComment>, req: Request): Promise<WithPagination<CommentViewModel>>;
  createComment(postId: string, input: PostCommentCreateDto, req: Request): Promise<CommentViewModel>;
}

export interface IPostsRepository extends IRepository<IPost> {
  createPost(input: PostCreateModel): Promise<PostMongoType>;
  updatePostById(id: string, input: PostUpdateDto): Promise<boolean>;
  getPostById(id: string): Promise<PostMongoType | null>;
  isPostExist(id: string): Promise<boolean>;
  updateLike(postId: string, likeStatus: LikeStatus, userId: string, userLogin: string): Promise<boolean>;
  deletePostById(id: string): Promise<boolean>;
}

export interface IPostsQueryRepository {
  getPosts<T>(
    userId: string | null,
    filter: Partial<PostMongoType>,
    query: PostPaginationRepositoryModel,
    mapper: PostListMapperType<T>,
  ): Promise<WithPagination<T>>;
  getPostById<T>(userId: UserIdReq, id: string, mapper: PostMapperType<T>): Promise<T | null>;
  isPostExist(id: string): Promise<boolean>;
}
