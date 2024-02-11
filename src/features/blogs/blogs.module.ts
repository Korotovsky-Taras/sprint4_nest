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
import { withTypedDbModule, withTypedRepository } from '../../application/utils/withTyped';
import { BlogsAdminController } from './api/blogs.admin.controller';
import { BlogsSqlOrmRepository } from './dao/sql-orm/blogs.sql-orm.repository';
import { BlogsSqlOrmQueryRepository } from './dao/sql-orm/blogs.sql-orm.query.repository';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogsEntity } from './dao/sql-orm/blogs.entity';

const BlogQueryRepoTyped = withTypedRepository(BlogQueryRepoKey, {
  Mongo: BlogsMongoQueryRepository,
  SQLRaw: BlogsSqlRawQueryRepository,
  SQLOrm: BlogsSqlOrmQueryRepository,
});
const BlogRepoTyped = withTypedRepository(BlogRepoKey, { Mongo: BlogsMongoRepository, SQLRaw: BlogsSqlRawRepository, SQLOrm: BlogsSqlOrmRepository });
const BlogsDbModuleTyped = withTypedDbModule({
  Mongo: MongooseModule.forFeature([
    {
      name: Blog.name,
      schema: BlogSchema,
    },
  ]),
  SQLOrm: TypeOrmModule.forFeature([BlogsEntity]),
});

@Module({
  imports: [CqrsModule, BlogsDbModuleTyped, forwardRef(() => PostsModule)],
  controllers: [BlogsController, BlogsAdminController],
  providers: [BlogsService, BlogQueryRepoTyped, BlogRepoTyped, IsBlogIdExistValidator, ...blogCases],
  exports: [BlogQueryRepoTyped, BlogRepoTyped],
})
export class BlogsModule {}
