import { ServiceResult } from '../../../application/core/ServiceResult';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { BlogsRepository } from '../dao/blogs.repository';
import { BlogMongoType } from '../types/dao';
import { BlogServiceError } from '../types/errors';

export class DeleteBlogByIdCommand {
  constructor(public readonly blogId: string) {}
}

@CommandHandler(DeleteBlogByIdCommand)
export class DeleteBlogByIdCase implements ICommandHandler<DeleteBlogByIdCommand, ServiceResult> {
  constructor(private readonly blogsRepo: BlogsRepository) {}

  async execute({ blogId }: DeleteBlogByIdCommand): Promise<ServiceResult> {
    const blog: BlogMongoType | null = await this.blogsRepo.getBlogById(blogId);
    const result = new ServiceResult();

    if (!blog) {
      result.addError({
        message: 'Blog not found',
        code: BlogServiceError.BLOG_NOT_FOUND,
      });
      return result;
    }

    const idDeleted = await this.blogsRepo.deleteBlogById(blogId);
    if (!idDeleted) {
      result.addError({
        message: 'Blog is not deleted',
        code: BlogServiceError.BLOG_NOT_DELETED,
      });
    }
    return result;
  }
}
