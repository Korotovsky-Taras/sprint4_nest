import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserIdReq } from '../../../application/utils/types';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { PostCommentCreateDto } from '../dto/PostCommentCreateDto';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';
import { CommentViewModel } from '../../comments/types/dto';
import { PostServiceError } from '../types/errors';
import { Inject } from '@nestjs/common';
import { IPostsRepository, PostRepoKey } from '../types/common';
import { IUsersRepository, UserRepoKey } from '../../users/types/common';
import { CommentsQueryRepoKey, CommentsRepoKey, ICommentsQueryRepository, ICommentsRepository } from '../../comments/types/common';

export class CreatePostCommentByIdCommand {
  constructor(
    public readonly postId: string,
    public readonly userId: UserIdReq,
    public readonly dto: PostCommentCreateDto,
  ) {}
}

@CommandHandler(CreatePostCommentByIdCommand)
export class CreatePostCommentByIdCase implements ICommandHandler<CreatePostCommentByIdCommand> {
  constructor(
    @Inject(CommentsRepoKey) private readonly commentsRepo: ICommentsRepository,
    @Inject(CommentsQueryRepoKey) private readonly commentsQueryRepo: ICommentsQueryRepository,
    @Inject(PostRepoKey) private readonly postsRepo: IPostsRepository,
    @Inject(UserRepoKey) private readonly usersRepo: IUsersRepository,
  ) {}

  async execute({ postId, userId, dto }: CreatePostCommentByIdCommand): Promise<ServiceResult<CommentViewModel>> {
    await validateOrRejectDto(dto, PostCommentCreateDto);

    const result = new ServiceResult<CommentViewModel>();

    if (!userId) {
      result.addError({
        code: PostServiceError.USER_NOT_FOUND,
      });
      return result;
    }

    const user = await this.usersRepo.getUserById(userId);

    if (!user) {
      result.addError({
        code: PostServiceError.USER_NOT_FOUND,
      });
      return result;
    }

    const postExist: boolean = await this.postsRepo.isPostByIdExist(postId);

    if (!postExist) {
      result.addError({
        code: PostServiceError.POST_NOT_FOUND,
      });
      return result;
    }

    const post = await this.postsRepo.getPostById(postId);

    if (!post) {
      result.addError({
        code: PostServiceError.POST_NOT_FOUND,
      });
      return result;
    }

    const commentId = await this.commentsRepo.createComment({
      postId: post._id.toString(),
      content: dto.content,
      commentatorInfo: {
        userId: user._id,
        userLogin: user.login,
      },
    });

    const comment: CommentViewModel | null = await this.commentsQueryRepo.getCommentById(userId, commentId);

    if (!comment) {
      result.addError({
        code: PostServiceError.COMMENT_NOT_CREATED,
      });
      return result;
    }

    result.setData(comment);

    return result;
  }
}
