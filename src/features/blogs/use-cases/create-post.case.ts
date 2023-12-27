import { ServiceResult } from '../../../application/core/ServiceResult';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UserIdReq } from '../../../application/utils/types';
import { BlogPostCreateDto } from '../dto/BlogPostCreateDto';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';
import { PostViewModel } from '../../posts/types/dto';
import { BlogServiceError } from '../types/errors';
import { Inject } from '@nestjs/common';
import { BlogRepoKey, IBlogsRepository } from '../types/common';
import { IPostsRepository, PostRepoKey } from '../../posts/types/common';
import { BlogViewModel } from '../types/dto';

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
    @Inject(BlogRepoKey) private readonly blogsRepo: IBlogsRepository<any>,
    @Inject(PostRepoKey) private readonly postsRepo: IPostsRepository<any>,
  ) {}

  async execute({ dto, blogId, userId }: CreateBlogPostCommand): Promise<ServiceResult<PostViewModel>> {
    await validateOrRejectDto(dto, BlogPostCreateDto);

    const result = new ServiceResult<PostViewModel>();

    const blog: BlogViewModel | null = await this.blogsRepo.getBlogById(blogId);

    if (!blog) {
      result.addError({
        code: BlogServiceError.BLOG_NOT_FOUND,
      });
      return result;
    }

    const post: PostViewModel = await this.postsRepo.createPost(
      {
        title: dto.title,
        shortDescription: dto.shortDescription,
        content: dto.content,
        blogId: blog.id,
        blogName: blog.name,
      },
      userId,
    );

    result.setData(post);

    return result;
  }
}
