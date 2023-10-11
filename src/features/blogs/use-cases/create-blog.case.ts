import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';
import { BlogsRepository } from '../dao/blogs.repository';
import { BlogCreateDto } from '../dto/BlogCreateDto';
import { BlogsDataMapper } from '../api/blogs.dm';
import { BlogViewModel } from '../types/dto';

export class CreateBlogCommand {
  constructor(public readonly dto: BlogCreateDto) {}
}

@CommandHandler(CreateBlogCommand)
export class CreateBlogCase implements ICommandHandler<CreateBlogCommand, BlogViewModel> {
  constructor(private readonly blogsRepo: BlogsRepository) {}

  async execute({ dto }: CreateBlogCommand): Promise<BlogViewModel> {
    await validateOrRejectDto(dto, BlogCreateDto);
    return await this.blogsRepo.createBlog(dto, BlogsDataMapper.toBlogView);
  }
}
