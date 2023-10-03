import { forwardRef, Module } from '@nestjs/common';
import { BlogsController } from './api/blogs.controller';
import { BlogsService } from './domain/blogs.service';
import { BlogsRepository } from './dao/blogs.repository';
import { BlogsQueryRepository } from './dao/blogs.query.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './dao/blogs.schema';
import { PostsModule } from '../posts/posts.module';
import { IsBlogIdExistValidator } from '../../application/decorators/validation/IsBlogExist';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Blog.name,
        schema: BlogSchema,
      },
    ]),
    forwardRef(() => PostsModule),
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BlogsRepository, BlogsQueryRepository, IsBlogIdExistValidator],
  exports: [BlogsRepository, BlogsQueryRepository],
})
export class BlogsModule {}