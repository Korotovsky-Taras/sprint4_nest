import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';
import { BlogCreateDto } from '../dto/BlogCreateDto';
import { BlogViewModel } from '../types/dto';
import { Inject } from '@nestjs/common';
import { BlogRepoKey, IBlogsRepository } from '../types/common';

export class CreateBlogCommand {
  constructor(public readonly dto: BlogCreateDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogCase implements ICommandHandler<CreateBlogCommand, BlogViewModel> {
  constructor(@Inject(BlogRepoKey) private readonly blogsRepo: IBlogsRepository<any>) {}

  async execute({ dto }: CreateBlogCommand): Promise<BlogViewModel> {
    await validateOrRejectDto(dto, BlogCreateDto);
    return await this.blogsRepo.createBlog(dto);
  }
}
