import { Injectable } from '@nestjs/common';
import { IBlogsRepository } from '../../types/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DeleteResult, Repository } from 'typeorm';
import { BlogCreateDto } from '../../dto/BlogCreateDto';
import { BlogViewModel } from '../../types/dto';
import { BlogUpdateDto } from '../../dto/BlogUpdateDto';
import { BlogsEntity } from './blogs.entity';
import { BlogsSqlOrmDataMapper } from './blogs.sql-orm.dm';

@Injectable()
export class BlogsSqlOrmRepository implements IBlogsRepository<BlogsEntity> {
  constructor(@InjectRepository(BlogsEntity) private blogsRepo: Repository<BlogsEntity>) {}

  async createBlog(model: BlogCreateDto): Promise<BlogViewModel> {
    const blog: BlogsEntity = BlogsEntity.createBlog(model);

    await this.saveDoc(blog);

    return BlogsSqlOrmDataMapper.toBlogView(blog);
  }

  async updateBlogById(id: string, input: BlogUpdateDto): Promise<boolean> {
    const blog: BlogsEntity | null = await this.blogsRepo.findOne({ where: { _id: Number(id) } });

    if (blog !== null) {
      blog.name = input.name;
      blog.description = input.description;
      blog.websiteUrl = input.websiteUrl;

      await this.saveDoc(blog);
      return true;
    }

    return false;
  }

  async deleteBlogById(id: string): Promise<boolean> {
    const result: DeleteResult = await this.blogsRepo
      .createQueryBuilder()
      .delete()
      .where({ _id: Number(id) })
      .execute();

    return result.affected != null && result.affected === 1;
  }

  async getBlogById(id: string): Promise<BlogViewModel | null> {
    const blog: BlogsEntity | null = await this.blogsRepo.findOne({ where: { _id: Number(id) } });
    if (blog != null) {
      return BlogsSqlOrmDataMapper.toBlogView(blog);
    }
    return null;
  }

  async clear(): Promise<void> {
    await this.blogsRepo.createQueryBuilder().delete().from(BlogsEntity).where('1=1').execute();
  }

  async saveDoc(doc: BlogsEntity): Promise<void> {
    await this.blogsRepo.save(doc);
  }
}
