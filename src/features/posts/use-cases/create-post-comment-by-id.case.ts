import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserIdReq } from '../../../application/utils/types';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { CommentsRepository } from '../../comments/dao/comments.repository';
import { PostCommentCreateDto } from '../dto/PostCommentCreateDto';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';
import { PostsRepository } from '../dao/posts.repository';
import { UsersRepository } from '../../users/dao/users.repository';
import { CommentsDataMapper } from '../../comments/api/comments.dm';
import { CommentViewModel } from '../../comments/types/dto';
import { PostServiceError } from '../types/errors';

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
    private readonly commentsRepo: CommentsRepository,
    private readonly postsRepo: PostsRepository,
    private readonly usersRepo: UsersRepository,
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

    const postExist: boolean = await this.postsRepo.isPostExist(postId);

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
        userId: user.id,
        userLogin: user.login,
      },
    });

    const comment = await this.commentsRepo.getCommentById(commentId);

    if (!comment) {
      result.addError({
        code: PostServiceError.COMMENT_NOT_CREATED,
      });
      return result;
    }

    result.setData(CommentsDataMapper.toCommentView(comment, userId));

    return result;
  }
}
