import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserIdReq } from '../../../application/utils/types';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';
import { PostCreateDto } from '../dto/PostCreateDto';
import { BlogDBType } from '../../blogs/types/dao';
import { PostServiceError } from '../types/errors';
import { PostViewModel } from '../types/dto';
import { Inject } from '@nestjs/common';
import { BlogRepoKey, IBlogsRepository } from '../../blogs/types/common';
import { IPostsRepository, PostRepoKey } from '../types/common';

export class CreatePostCommand {
  constructor(
    public readonly userId: UserIdReq,
    public readonly dto: PostCreateDto,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    @Inject(PostRepoKey) private readonly postsRepo: IPostsRepository,
    @Inject(BlogRepoKey) private readonly blogsRepo: IBlogsRepository,
  ) {}

  async execute({ userId, dto }: CreatePostCommand): Promise<ServiceResult<PostViewModel>> {
    await validateOrRejectDto(dto, PostCreateDto);

    const result = new ServiceResult<PostViewModel>();

    const blog: BlogDBType | null = await this.blogsRepo.getBlogById(dto.blogId);

    if (!blog) {
      result.addError({
        code: PostServiceError.BLOG_NOT_FOUND,
      });
      return result;
    }

    const post = await this.postsRepo.createPost(
      {
        title: dto.title,
        shortDescription: dto.shortDescription,
        content: dto.content,
        blogId: blog._id.toString(),
        blogName: blog.name,
      },
      userId,
    );

    result.setData(post);

    return result;
  }
}
