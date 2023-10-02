import { Injectable } from '@nestjs/common';
import { CommentMapperType, ICommentsService } from '../types/common';
import { UserIdReq } from '../../../application/utils/types';
import { CommentLikeStatusInputModel } from '../types/dto';
import { CommentDocumentType, ICommentModel } from '../types/dao';
import { PostViewModel } from '../../posts/types/dto';
import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from '../dao/comments.schema';
import { CommentsRepository } from '../dao/comments.repository';
import { CommentsQueryRepository } from '../dao/comments.query.repository';
import { PostsQueryRepository } from '../../posts/dao/posts.query.repository';
import { PostsDataMapper } from '../../posts/api/posts.dm';
import { UsersQueryRepository } from '../../users/dao/users.query.repository';
import { UserViewModel } from '../../users/types/dto';
import { UsersDataMapper } from '../../users/api/users.dm';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { PostCommentCreateDto } from '../../posts/dto/PostCommentCreateDto';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';
import { CommentUpdateDto } from '../dto/CommentUpdateDto';

@Injectable()
export class CommentsService implements ICommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: ICommentModel,
    private readonly commentsRepo: CommentsRepository,
    private readonly commentsQueryRepo: CommentsQueryRepository,
    private readonly usersQueryRepo: UsersQueryRepository,
    private readonly postsQueryRepo: PostsQueryRepository,
  ) {}

  async updateCommentById(commentId: string, userId: UserIdReq, dto: CommentUpdateDto): Promise<ServiceResult> {
    await validateOrRejectDto(dto, CommentUpdateDto);

    const result = new ServiceResult();

    const comment: boolean = await this.commentsQueryRepo.isCommentExist(commentId);

    if (!comment || !userId) {
      result.addError({
        code: CommentServiceError.COMMENT_NOT_FOUND,
      });
      return result;
    }

    const isUserCommentOwner: boolean = await this.commentsQueryRepo.isUserCommentOwner(commentId, userId);

    if (!isUserCommentOwner) {
      result.addError({
        code: CommentServiceError.COMMENT_ACCESS_DENIED,
      });
      return result;
    }

    const isUpdated: boolean = await this.commentsRepo.updateCommentById(commentId, dto);

    if (isUpdated) {
      //TODO не обновилось по другим причинам?
    }

    return result;
  }

  async deleteCommentById(commentId: string, userId: string | null): Promise<ServiceResult> {
    const result = new ServiceResult();

    const comment: boolean = await this.commentsQueryRepo.isCommentExist(commentId);

    if (!comment || !userId) {
      result.addError({
        code: CommentServiceError.COMMENT_NOT_FOUND,
      });
      return result;
    }

    const isUserCommentOwner: boolean = await this.commentsQueryRepo.isUserCommentOwner(commentId, userId);

    if (!isUserCommentOwner) {
      result.addError({
        code: CommentServiceError.COMMENT_ACCESS_DENIED,
      });
      return result;
    }

    const isDeleted: boolean = await this.commentsRepo.deleteCommentById(commentId);

    if (!isDeleted) {
      //TODO не обновилось по другим причинам?
    }
    return result;
  }

  async createComment<T>(postId: string, userId: UserIdReq, dto: PostCommentCreateDto, mapper: CommentMapperType<T>): Promise<ServiceResult<T>> {
    await validateOrRejectDto(dto, PostCommentCreateDto);

    const postExist: boolean = await this.postsQueryRepo.isPostExist(postId);
    const result = new ServiceResult<T>();

    if (!userId) {
      result.addError({
        message: `User not found`,
        code: CommentServiceError.USER_NOT_FOUND,
      });
    } else if (!postExist) {
      result.addError({
        message: `Post not found`,
        code: CommentServiceError.POST_NOT_FOUND,
      });
    } else {
      const user: UserViewModel | null = await this.usersQueryRepo.getUserById(userId, UsersDataMapper.toUserView);

      if (!user) {
        result.addError({
          message: `User not found`,
          code: CommentServiceError.USER_NOT_FOUND,
        });
      } else {
        const post: PostViewModel | null = await this.postsQueryRepo.getPostById(userId, postId, PostsDataMapper.toPostView);

        if (!post) {
          result.addError({
            message: `Post not found`,
            code: CommentServiceError.POST_NOT_FOUND,
          });
        } else {
          const comment: CommentDocumentType = this.commentModel.createComment({
            postId: post.id,
            content: dto.content,
            commentatorInfo: {
              userId: user.id,
              userLogin: user.login,
            },
          });
          await this.commentsRepo.saveDoc(comment);

          result.setData(mapper(comment, userId));
        }
      }
    }

    return result;
  }

  async updateLikeStatus(userId: UserIdReq, model: CommentLikeStatusInputModel): Promise<ServiceResult> {
    const result = new ServiceResult();

    if (userId === null) {
      result.addError({
        code: CommentServiceError.USER_ID_REQUIRED,
      });
      return result;
    }

    const userModel: UserViewModel | null = await this.usersQueryRepo.getUserById(userId, UsersDataMapper.toUserView);

    if (userModel === null) {
      result.addError({
        code: CommentServiceError.USER_NOT_FOUND,
      });
      return result;
    }

    const comment: CommentDocumentType | null = await this.commentModel.findOne({ _id: new ObjectId(model.commentId) }).exec();

    if (comment === null) {
      result.addError({
        code: CommentServiceError.COMMENT_NOT_FOUND,
      });
      return result;
    }

    comment.updateLike(userModel.id, userModel.login, model.status);

    await this.commentsRepo.saveDoc(comment);

    return result;
  }
}

export enum CommentServiceError {
  POST_NOT_FOUND = 1,
  USER_NOT_FOUND = 2,
  USER_ID_REQUIRED = 3,
  COMMENT_NOT_FOUND = 4,
  COMMENT_ACCESS_DENIED = 5,
}
