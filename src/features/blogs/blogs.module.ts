import { forwardRef, Module } from '@nestjs/common';
import { BlogsController } from './api/blogs.controller';
import { BlogsService } from './domain/blogs.service';
import { BlogsMongoRepository } from './dao/mongo/blogs.mongo.repository';
import { BlogsMongoQueryRepository } from './dao/mongo/blogs.mongo.query.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Blog, BlogSchema } from './dao/mongo/blogs.mongo.schema';
import { PostsModule } from '../posts/posts.module';
import { IsBlogIdExistValidator } from '../../application/decorators/validation/IsBlogExist';
import { blogCases } from './use-cases';
import { CqrsModule } from '@nestjs/cqrs';
import { BlogsSqlRawRepository } from './dao/sql-raw/blogs.sql-raw.repository';
import { BlogsSqlRawQueryRepository } from './dao/sql-raw/blogs.sql-raw.query.repository';
import { BlogQueryRepoKey, BlogRepoKey } from './types/common';
import { withDbTypedClass } from '../../application/utils/withTypedClass';

const BlogQueryRepoTyped = withDbTypedClass(BlogQueryRepoKey, { Mongo: BlogsMongoQueryRepository, SQLRaw: BlogsSqlRawQueryRepository });
const BlogRepoTyped = withDbTypedClass(BlogRepoKey, { Mongo: BlogsMongoRepository, SQLRaw: BlogsSqlRawRepository });

@Module({
  imports: [
    CqrsModule,
    MongooseModule.forFeature([
      {
        name: Blog.name,
        schema: BlogSchema,
      },
    ]),
    forwardRef(() => PostsModule),
  ],
  controllers: [BlogsController],
  providers: [BlogsService, BlogQueryRepoTyped, BlogRepoTyped, IsBlogIdExistValidator, ...blogCases],
  exports: [BlogQueryRepoTyped, BlogRepoTyped],
})
export class BlogsModule {}
