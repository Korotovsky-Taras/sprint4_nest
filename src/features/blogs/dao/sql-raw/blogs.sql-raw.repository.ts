import { Injectable } from '@nestjs/common';
import { IBlogsRepository } from '../../types/common';
import { BlogDBType } from '../../types/dao';
import { BlogCreateDto } from '../../dto/BlogCreateDto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { BlogUpdateDto } from '../../dto/BlogUpdateDto';
import { BlogViewModel } from '../../types/dto';
import { BlogsSqlRawDataMapper } from './blogs.sql-raw.dm';

@Injectable()
export class BlogsSqlRawRepository implements IBlogsRepository<void> {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createBlog(input: BlogCreateDto): Promise<BlogViewModel> {
    const res = await this.dataSource.query<BlogDBType[]>(`INSERT INTO public."Blogs"(name, description, "websiteUrl") VALUES ($1, $2, $3) RETURNING *;`, [
      input.name,
      input.description,
      input.websiteUrl,
    ]);
    return BlogsSqlRawDataMapper.toBlogView(res[0]);
  }

  async updateBlogById(id: string, input: BlogUpdateDto): Promise<boolean> {
    const [, count] = await this.dataSource.query(`UPDATE public."Blogs" as b SET name=$2, description=$3, "websiteUrl"=$4 WHERE b."_id" = $1`, [
      id,
      input.name,
      input.description,
      input.websiteUrl,
    ]);

    return count > 0;
  }

  async deleteBlogById(id: string): Promise<boolean> {
    const [, count] = await this.dataSource.query(`DELETE FROM public."Blogs" as b WHERE b."_id" = $1`, [id]);

    return count > 0;
  }

  async getBlogById(id: string): Promise<BlogViewModel | null> {
    const res = await this.dataSource.query<BlogDBType[]>(`SELECT *FROM public."Blogs" as b WHERE b."_id" = $1`, [id]);
    if (res.length > 0) {
      return BlogsSqlRawDataMapper.toBlogView(res[0]);
    }
    return null;
  }

  clear(): Promise<void> {
    return this.dataSource.query(`TRUNCATE TABLE public."Blogs" CASCADE`);
  }

  saveDoc(): Promise<void> {
    return Promise.resolve();
  }
}
