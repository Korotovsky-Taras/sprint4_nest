import { PostCreateModel, PostViewModel } from './dto';
import { IRepository, IService } from '../../types';
import { Request } from 'express';
import { CommentViewModel } from '../../comments/types/dto';
import { UserIdReq, WithPagination } from '../../../application/utils/types';
import { PostCreateDto } from '../dto/PostCreateDto';
import { PostUpdateDto } from '../dto/PostUpdateDto';
import { PostCommentCreateDto } from '../dto/PostCommentCreateDto';
import { LikeStatus } from '../../likes/types';
import { PostPaginationQueryDto } from '../dto/PostPaginationQueryDto';
import { CommentsPaginationQueryDto } from '../../comments/dto/CommentsPaginationQueryDto';
import { BlogPostUpdateDto } from '../../blogs/dto/BlogPostUpdateDto';

export interface IPostsService extends IService {}

export interface IPostsController {
  getAll(query: PostPaginationQueryDto, req: Request): Promise<WithPagination<PostViewModel>>;
  getPost(postId: string, req: Request): Promise<PostViewModel>;
  createPost(input: PostCreateDto, req: Request): Promise<PostViewModel>;
  updatePost(postId: string, input: PostUpdateDto): Promise<void>;
  deletePost(postId: string): Promise<void>;
  getComments(postId: string, query: CommentsPaginationQueryDto, req: Request): Promise<WithPagination<CommentViewModel>>;
  createComment(postId: string, input: PostCommentCreateDto, req: Request): Promise<CommentViewModel>;
}

export const PostRepoKey = Symbol('POSTS_REPO');

export interface IPostsRepository<T> extends IRepository<T> {
  createPost(input: PostCreateModel, userId: UserIdReq): Promise<PostViewModel>;
  updatePostById(id: string, input: PostUpdateDto): Promise<boolean>;
  isPostByIdExist(id: string): Promise<boolean>;
  updateLike(postId: string, likeStatus: LikeStatus, userId: string, userLogin: string): Promise<boolean>;
  deletePostById(id: string): Promise<boolean>;
  isBlogPostByIdExist(blogId: string, postId: string): Promise<boolean>;
  updateBlogPostById(blogId: string, postId: string, dto: BlogPostUpdateDto): Promise<boolean>;
  deleteBlogPostById(blogId: string, postId: string): Promise<boolean>;
}

export const PostQueryRepoKey = Symbol('POSTS_QUERY_REPO');

export interface IPostsQueryRepository {
  getBlogPosts(userId: string | null, blogId: string, query: PostPaginationQueryDto): Promise<WithPagination<PostViewModel>>;
  getAllPosts(userId: string | null, query: PostPaginationQueryDto): Promise<WithPagination<PostViewModel>>;
  getPostById(userId: UserIdReq, postId: string): Promise<PostViewModel | null>;
  isPostExist(postId: string): Promise<boolean>;
}
