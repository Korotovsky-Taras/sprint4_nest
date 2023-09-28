import { ForbiddenException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { CommentMapperType, ICommentsService } from '../types/common';
import { UserIdReq } from '../../../application/utils/types';
import { CommentLikeStatusInputDto, CommentUpdateDto } from '../types/dto';
import { CommentDocumentType, ICommentModel } from '../types/dao';
import { PostCommentCreateDto, PostViewDto } from '../../posts/types/dto';
import { ObjectId } from 'mongodb';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from '../dao/comments.schema';
import { CommentsRepository } from '../dao/comments.repository';
import { CommentsQueryRepository } from '../dao/comments.query.repository';
import { PostsQueryRepository } from '../../posts/dao/posts.query.repository';
import { PostsDataMapper } from '../../posts/api/posts.dm';
import { UsersQueryRepository } from '../../users/dao/users.query.repository';
import { UserViewDto } from '../../users/types/dto';
import { UsersDataMapper } from '../../users/api/users.dm';
import { ServiceResult } from '../../../application/errors/ServiceResult';

@Injectable()
export class CommentsService implements ICommentsService {
  constructor(
    @InjectModel(Comment.name) private commentModel: ICommentModel,
    private readonly commentsRepo: CommentsRepository,
    private readonly commentsQueryRepo: CommentsQueryRepository,
    private readonly usersQueryRepo: UsersQueryRepository,
    private readonly postsQueryRepo: PostsQueryRepository,
  ) {}

  //TODO ошибки выкидывает контроллер
  async updateCommentById(commentId: string, userId: UserIdReq, model: CommentUpdateDto): Promise<void> {
    const comment: boolean = await this.commentsQueryRepo.isCommentExist(commentId);

    if (!comment || !userId) {
      throw new NotFoundException();
    }

    const isUserCommentOwner: boolean = await this.commentsQueryRepo.isUserCommentOwner(commentId, userId);

    if (!isUserCommentOwner) {
      throw new ForbiddenException();
    }

    const isUpdated: boolean = await this.commentsRepo.updateCommentById(commentId, model);

    if (isUpdated) {
      //TODO не обновилось по другим причинам?
    }
  }

  //TODO ошибки выкидывает контроллер
  async deleteCommentById(commentId: string, userId: string | null): Promise<void> {
    const comment: boolean = await this.commentsQueryRepo.isCommentExist(commentId);

    if (!comment || !userId) {
      throw new NotFoundException();
    }

    const isUserCommentOwner: boolean = await this.commentsQueryRepo.isUserCommentOwner(commentId, userId);

    if (!isUserCommentOwner) {
      throw new ForbiddenException();
    }

    const isDeleted: boolean = await this.commentsRepo.deleteCommentById(commentId);

    if (!isDeleted) {
      //TODO не обновилось по другим причинам?
    }
  }

  async createComment<T>(postId: string, userId: UserIdReq, model: PostCommentCreateDto, dto: CommentMapperType<T>): Promise<ServiceResult<T>> {
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
      const user: UserViewDto | null = await this.usersQueryRepo.getUserById(userId, UsersDataMapper.toUserView);

      if (!user) {
        result.addError({
          message: `User not found`,
          code: CommentServiceError.USER_NOT_FOUND,
        });
      } else {
        const post: PostViewDto | null = await this.postsQueryRepo.getPostById(userId, postId, PostsDataMapper.toPostView);

        if (!post) {
          result.addError({
            message: `Post not found`,
            code: CommentServiceError.POST_NOT_FOUND,
          });
        } else {
          const comment: CommentDocumentType = this.commentModel.createComment({
            postId: post.id,
            content: model.content,
            commentatorInfo: {
              userId: user.id,
              userLogin: user.login,
            },
          });
          await this.commentsRepo.saveDoc(comment);

          result.setData(dto(comment, userId));
        }
      }
    }

    return result;
  }

  async updateLikeStatus(userId: UserIdReq, model: CommentLikeStatusInputDto): Promise<void> {
    if (userId === null) {
      throw new UnauthorizedException();
    }

    const userExist: boolean = await this.usersQueryRepo.isUserExist(userId);

    if (!userExist) {
      throw new UnauthorizedException();
    }

    const comment: CommentDocumentType | null = await this.commentModel.findOne({ _id: new ObjectId(model.commentId) }).exec();

    if (!comment) {
      throw new NotFoundException();
    }

    comment.updateLike(userId, model.status);

    await this.commentsRepo.saveDoc(comment);
  }
}

export enum CommentServiceError {
  POST_NOT_FOUND = 1,
  USER_NOT_FOUND = 2,
}
