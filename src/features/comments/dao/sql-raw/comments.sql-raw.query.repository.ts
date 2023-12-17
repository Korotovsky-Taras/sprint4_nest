import { Injectable } from '@nestjs/common';
import { ICommentsQueryRepository } from '../../types/common';
import { ICommentSqlRaw } from '../../types/dao';
import { UserIdReq, WithPagination } from '../../../../application/utils/types';
import { withSqlRawPagination } from '../../../../application/utils/withSqlRawPagination';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CommentsPaginationQueryDto } from '../../dto/CommentsPaginationQueryDto';
import { CommentViewModel } from '../../types/dto';
import { CommentsSqlRawDataMapper } from '../../api/comments.sql-raw.dm';

@Injectable()
export class CommentsSqlRawQueryRepository implements ICommentsQueryRepository {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async getComments(userId: UserIdReq, postId: string, query: CommentsPaginationQueryDto): Promise<WithPagination<CommentViewModel>> {
    const sql = `SELECT pc.*, CAST(count(*) OVER() as INTEGER) as "totalCount",
                        (SELECT row_to_json(row) as "likesInfo"
                         FROM (SELECT (SELECT count(*) FROM public."PostsCommentsLikes" WHERE "commentId" = pc._id AND "likeStatus" = 1) as "likesCount",
                                      (SELECT count(*) FROM public."PostsCommentsLikes" WHERE "commentId" = pc._id AND "likeStatus" = 0) as "dislikesCount",
                                      (SELECT "likeStatus" FROM public."PostsCommentsLikes" WHERE "commentId" = pc._id AND "userId" = $3) as "myStatus"
                               ) as row),
                        (SELECT row_to_json(row) as "commentatorInfo"
                         FROM (SELECT "_id" as "userId", "login" as "userLogin" FROM public."Users" as u WHERE u."_id" = pc."userId" ) as row)
                 FROM public."PostsComments" as pc WHERE pc."postId" = $4 ORDER BY "${query.sortBy}" ${query.sortDirection} LIMIT $1 OFFSET $2
    `;

    return withSqlRawPagination<ICommentSqlRaw, CommentViewModel>(this.dataSource, sql, [Number(userId), Number(postId)], query, (items) => {
      return CommentsSqlRawDataMapper.toCommentsView(items);
    });
  }

  async getCommentById(userId: UserIdReq, commentId: string): Promise<CommentViewModel | null> {
    const res = await this.dataSource.query<ICommentSqlRaw[]>(
      `SELECT pc.*,
                    (SELECT row_to_json(row) as "likesInfo"
                     FROM (SELECT (SELECT count(*) FROM public."PostsCommentsLikes" WHERE "commentId" = pc._id AND "likeStatus" = 1) as "likesCount",
                                  (SELECT count(*) FROM public."PostsCommentsLikes" WHERE "commentId" = pc._id AND "likeStatus" = 0) as "dislikesCount",
                                  (SELECT "likeStatus" FROM public."PostsCommentsLikes" WHERE "commentId" = pc._id AND "userId" = $2) as "myStatus"
                          ) as row),
                    (SELECT row_to_json(row) as "commentatorInfo"
                     FROM (SELECT "_id" as "userId", "login" as "userLogin" FROM public."Users" as u WHERE u."_id" = pc."userId" ) as row)
               FROM public."PostsComments" as pc WHERE pc."_id" = $1`,
      [Number(commentId), Number(userId)],
    );
    if (res.length > 0) {
      return CommentsSqlRawDataMapper.toCommentView(res[0]);
    }
    return null;
  }
}
