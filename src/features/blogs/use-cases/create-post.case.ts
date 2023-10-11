import { ServiceResult } from '../../../application/core/ServiceResult';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserIdReq } from '../../../application/utils/types';
import { BlogPostCreateDto } from '../dto/BlogPostCreateDto';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';
import { PostViewModel } from '../../posts/types/dto';
import { PostsDataMapper } from '../../posts/api/posts.dm';
import { BlogsRepository } from '../dao/blogs.repository';
import { PostsRepository } from '../../posts/dao/posts.repository';
import { BlogMongoType } from '../types/dao';
import { BlogServiceError } from '../types/errors';

export class CreatePostCommand {
  constructor(
    public readonly userId: UserIdReq,
    public readonly blogId: string,
    public readonly dto: BlogPostCreateDto,
  ) {}
}

@CommandHandler(CreatePostCommand)
export class CreatePostCase implements ICommandHandler<CreatePostCommand, ServiceResult<PostViewModel>> {
  constructor(
    private readonly blogsRepo: BlogsRepository,
    private readonly postsRepo: PostsRepository,
  ) {}

  async execute({ dto, blogId, userId }: CreatePostCommand): Promise<ServiceResult<PostViewModel>> {
    await validateOrRejectDto(dto, BlogPostCreateDto);

    const blog: BlogMongoType | null = await this.blogsRepo.getBlogById(blogId);
    const result = new ServiceResult<PostViewModel>();

    if (!blog) {
      result.addError({
        message: 'Blog not found',
        code: BlogServiceError.BLOG_NOT_FOUND,
      });
      return result;
    }

    const post: PostViewModel = await this.postsRepo.createPost(
      userId,
      {
        title: dto.title,
        shortDescription: dto.shortDescription,
        content: dto.content,
        blogId: blog._id.toString(),
        blogName: blog.name,
      },
      PostsDataMapper.toPostView,
    );
    result.setData(post);

    return result;
  }
}
