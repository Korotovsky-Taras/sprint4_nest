import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserIdReq } from '../../../application/utils/types';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';
import { PostsRepository } from '../dao/posts.repository';
import { PostCreateDto } from '../dto/PostCreateDto';
import { PostsDataMapper } from '../api/posts.dm';
import { BlogsRepository } from '../../blogs/dao/blogs.repository';
import { BlogMongoType } from '../../blogs/types/dao';
import { PostServiceError } from '../types/errors';
import { PostViewModel } from '../types/dto';

export class CreatePostCommand {
  constructor(
    public readonly userId: UserIdReq,
    public readonly dto: PostCreateDto,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostCase implements ICommandHandler<CreatePostCommand> {
  constructor(
    private readonly postsRepo: PostsRepository,
    private readonly blogsRepo: BlogsRepository,
  ) {}

  async execute({ userId, dto }: CreatePostCommand): Promise<ServiceResult<PostViewModel>> {
    await validateOrRejectDto(dto, PostCreateDto);

    const result = new ServiceResult<PostViewModel>();

    const blog: BlogMongoType | null = await this.blogsRepo.getBlogById(dto.blogId);

    if (!blog) {
      result.addError({
        code: PostServiceError.BLOG_NOT_FOUND,
      });
      return result;
    }

    const post = await this.postsRepo.createPost({
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: blog._id.toString(),
      blogName: blog.name,
    });

    result.setData(PostsDataMapper.toPostView(post, userId));

    return result;
  }
}
