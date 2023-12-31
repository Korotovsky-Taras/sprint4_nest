import { Injectable } from '@nestjs/common';
import { IPostSqlRaw, PostDBType } from '../../types/dao';
import { IPostsQueryRepository } from '../../types/common';
import { UserIdReq, WithPagination } from '../../../../application/utils/types';
import { DataSource } from 'typeorm';
import { InjectDataSource } from '@nestjs/typeorm';
import { withSqlRawPagination } from '../../../../application/utils/withSqlRawPagination';
import { PostPaginationQueryDto } from '../../dto/PostPaginationQueryDto';
import { PostsSqlRawDataMapper } from './posts.sql-raw.dm';
import { PostViewModel } from '../../types/dto';

@Injectable()
export class PostsSqlRawQueryRepository implements IPostsQueryRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async getBlogPosts(userId: string | null, blogId: string, query: PostPaginationQueryDto): Promise<WithPagination<PostViewModel>> {
    const sortByWithCollate = query.sortBy !== 'createdAt' ? 'COLLATE "C"' : '';

    return withSqlRawPagination<IPostSqlRaw, PostViewModel>(
      this.dataSource,
      `SELECT res.* FROM (SELECT p.*, CAST(count(*) OVER() as INTEGER) as "totalCount",
          (SELECT row_to_json(row) as "likesInfo" FROM
            (SELECT (SELECT count(*) FROM public."PostsLikes" WHERE "postId" = p."_id" AND "likeStatus" = 1) as "likesCount",
                    (SELECT count(*) FROM public."PostsLikes" WHERE "postId" = p."_id" AND "likeStatus" = 0) as "dislikesCount",
                    (SELECT "likeStatus" FROM public."PostsLikes" WHERE "postId" = p."_id" AND "userId" = $4) as "myStatus"
            ) as row),
          (SELECT array(SELECT row_to_json(row) FROM (
               SELECT pl."createdAt", U.login as "userLogin", U."_id" as "userId"
               FROM "PostsLikes" pl
               LEFT JOIN "Users" U ON pl."userId" = U."_id"
               WHERE pl."likeStatus" = 1 AND pl."postId" = p."_id"
               ORDER BY pl."createdAt" DESC
               LIMIT 3
               OFFSET 0
           ) as row)) as "lastLikes",
           (SELECT "name" FROM public."Blogs" as b WHERE b."_id" = p."blogId") as "blogName"
       FROM public."Posts" as p WHERE p."blogId" = $3) as res
       ORDER BY "${query.sortBy}" ${sortByWithCollate} ${query.sortDirection} LIMIT $1 OFFSET $2`,
      [Number(blogId), Number(userId)],
      query,
      (items) => {
        return PostsSqlRawDataMapper.toPostsView(items);
      },
    );
  }

  async getAllPosts(userId: UserIdReq, query: PostPaginationQueryDto): Promise<WithPagination<PostViewModel>> {
    const sortByWithCollate = query.sortBy !== 'createdAt' ? 'COLLATE "C"' : '';

    return withSqlRawPagination<IPostSqlRaw, PostViewModel>(
      this.dataSource,
      `SELECT res.* FROM (SELECT p.*, CAST(count(*) OVER() as INTEGER) as "totalCount",
          (SELECT row_to_json(row) as "likesInfo" FROM
            (SELECT (SELECT count(*) FROM public."PostsLikes" WHERE "postId" = p."_id" AND "likeStatus" = 1) as "likesCount",
                    (SELECT count(*) FROM public."PostsLikes" WHERE "postId" = p."_id" AND "likeStatus" = 0) as "dislikesCount",
                    (SELECT "likeStatus" FROM public."PostsLikes" WHERE "postId" = p."_id" AND "userId" = $3) as "myStatus"
            ) as row),
          (SELECT array(SELECT row_to_json(row) FROM (
               SELECT pl."createdAt", U.login as "userLogin", U._id as "userId"
               FROM "PostsLikes" pl
               LEFT JOIN "Users" U ON pl."userId" = U._id
               WHERE pl."likeStatus" = 1 AND pl."postId" = p._id
               ORDER BY pl."createdAt" DESC
               LIMIT 3
               OFFSET 0
           ) as row)) as "lastLikes",
          (SELECT "name" FROM public."Blogs" as b WHERE b."_id" = p."blogId") as "blogName" 
       FROM public."Posts" as p ) as res
       ORDER BY "${query.sortBy}" ${sortByWithCollate} ${query.sortDirection} LIMIT $1 OFFSET $2`,
      [Number(userId)],
      query,
      (items) => {
        return PostsSqlRawDataMapper.toPostsView(items);
      },
    );
  }

  async getPostById(userId: UserIdReq, postId: string): Promise<PostViewModel | null> {
    const res = await this.dataSource.query<IPostSqlRaw[]>(
      `SELECT res.* FROM (SELECT p.*, (SELECT row_to_json(row) as "likesInfo" FROM
          (SELECT (SELECT count(*) FROM public."PostsLikes" WHERE "postId" = p._id and "likeStatus" = 1) as "likesCount",
                  (SELECT count(*) FROM public."PostsLikes" WHERE "postId" = p._id and "likeStatus" = 0) as "dislikesCount",
                  (SELECT "likeStatus" FROM public."PostsLikes" WHERE "postId" = p._id and "userId" = $2) as "myStatus"
                  
          ) as row),
         (SELECT array(SELECT row_to_json(row) FROM (
              SELECT pl."createdAt", U.login as "userLogin", U._id as "userId"
              FROM "PostsLikes" pl
              LEFT JOIN "Users" U ON pl."userId" = U._id
              WHERE pl."likeStatus" = 1 AND pl."postId" = p._id
              ORDER BY pl."createdAt" DESC 
              LIMIT 3
              OFFSET 0
          ) as row)) as "lastLikes",
        (SELECT "name" FROM public."Blogs" as b WHERE b."_id" = p."blogId") as "blogName" 
       FROM public."Posts" as p WHERE p."_id" = $1) as res
       `,
      [Number(postId), Number(userId)],
    );

    if (res.length > 0) {
      return PostsSqlRawDataMapper.toPostView(res[0]);
    }

    return null;
  }

  async isPostExist(postId: string): Promise<boolean> {
    const res = await this.dataSource.query<PostDBType[]>(`SELECT * FROM public."Posts" as p WHERE p."_id" = $1`, [Number(postId)]);
    return res.length > 0;
  }
}
