import { Module } from '@nestjs/common';
import { BlogsDataMapper } from './api/blogs.dm';
import { BlogsQueryRepository } from './dao/blogs.query.repository';
import { BlogsRepository } from './dao/blogs.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './dao/blogs.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Blog.name,
        schema: BlogSchema,
      },
    ]),
  ],
  providers: [BlogsRepository, BlogsQueryRepository, BlogsDataMapper],
  exports: [BlogsRepository, BlogsQueryRepository, BlogsDataMapper],
})
export class BlogsCommonModule {}
