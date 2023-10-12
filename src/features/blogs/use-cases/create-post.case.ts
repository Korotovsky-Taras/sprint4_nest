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

export class CreateBlogPostCommand {
  constructor(
    public readonly userId: UserIdReq,
    public readonly blogId: string,
    public readonly dto: BlogPostCreateDto,
  ) {}
}

@CommandHandler(CreateBlogPostCommand)
export class CreateBlogPostCase implements ICommandHandler<CreateBlogPostCommand, ServiceResult<PostViewModel>> {
  constructor(
    private readonly blogsRepo: BlogsRepository,
    private readonly postsRepo: PostsRepository,
  ) {}

  async execute({ dto, blogId, userId }: CreateBlogPostCommand): Promise<ServiceResult<PostViewModel>> {
    await validateOrRejectDto(dto, BlogPostCreateDto);

    const result = new ServiceResult<PostViewModel>();

    const blog: BlogMongoType | null = await this.blogsRepo.getBlogById(blogId);

    if (!blog) {
      result.addError({
        code: BlogServiceError.BLOG_NOT_FOUND,
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
