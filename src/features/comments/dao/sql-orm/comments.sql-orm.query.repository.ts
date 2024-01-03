import { Injectable } from '@nestjs/common';
import { ICommentsQueryRepository } from '../../types/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { UserIdReq, WithPagination } from '../../../../application/utils/types';
import { CommentsPaginationQueryDto } from '../../dto/CommentsPaginationQueryDto';
import { CommentViewModel } from '../../types/dto';
import { ICommentSqlRaw } from '../../types/dao';
import { CommentsSqlRawDataMapper } from '../sql-raw/comments.sql-raw.dm';
import { PostsCommentsEntity } from './entities/posts-comments.entity';
import { withSqlOrmPagination } from '../../../../application/utils/withSqlOrmPagination';
import { UsersEntity } from '../../../users/dao/sql-orm/entities/users.entity';
import { PostsCommentsLikesEntity } from './entities/posts-comments-likes.entity';
import { isNumber } from 'class-validator';

@Injectable()
export class CommentsSqlOrmQueryRepository implements ICommentsQueryRepository {
  constructor(
    @InjectRepository(PostsCommentsEntity) private commentsRepo: Repository<PostsCommentsEntity>,
    @InjectEntityManager() private manager: EntityManager,
  ) {}

  async getComments(userId: UserIdReq, postId: string, query: CommentsPaginationQueryDto): Promise<WithPagination<CommentViewModel>> {
    const qb = this.manager.createQueryBuilder();

    const queryBuilder = qb.select('res.*').from((subQuery) => {
      return subQuery
        .select('pc.*')
        .addSelect((qb) => {
          return qb.select('row_to_json(row)', 'likesInfo').from((fqb) => {
            return fqb
              .select()
              .fromDummy()
              .addSelect((qb1) => {
                return qb1
                  .select('ple."likeStatus"', 'myStatus')
                  .from(PostsCommentsLikesEntity, 'ple')
                  .where('ple."commentId" = pc."_id"')
                  .andWhere('ple."userId" = :userId', { userId: Number(userId) });
              })
              .addSelect((qb2) => {
                return qb2.select('count(*)').from(PostsCommentsLikesEntity, 'ple').where('ple."commentId" = pc."_id"').andWhere('ple."likeStatus" = 1');
              }, 'likesCount')
              .addSelect((qb3) => {
                return qb3.select('count(*)').from(PostsCommentsLikesEntity, 'ple').where('ple."commentId" = pc."_id"').andWhere('ple."likeStatus" = 0');
              }, 'dislikesCount');
          }, 'row');
        })
        .addSelect((qb) => {
          return qb.select('row_to_json(row)', 'commentatorInfo').from((fqb) => {
            return fqb.select('pu."_id"', 'userId').addSelect('pu."login"', 'userLogin').from(UsersEntity, 'pu').where(`pu."_id" = pc."userId"`);
          }, 'row');
        })
        .from(PostsCommentsEntity, 'pc')
        .leftJoin('pc.user', 'pu')
        .where('pc."postId" = :postId', { postId: Number(postId) });
    }, 'res');

    const sortByWithCollate = query.sortBy !== 'createdAt' ? 'COLLATE "C"' : '';

    return withSqlOrmPagination<ICommentSqlRaw, CommentViewModel>(queryBuilder, query, sortByWithCollate, (items) => {
      return CommentsSqlRawDataMapper.toCommentsView(items);
    });
  }

  async getCommentById(userId: UserIdReq, commentId: string): Promise<CommentViewModel | null> {
    if (!isNumber(Number(commentId))) {
      return null;
    }

    const queryBuilder = this.commentsRepo.createQueryBuilder('pc');

    queryBuilder
      .leftJoin('pc.user', 'pu')
      .select('pc.*')
      .addSelect((qb) => {
        return qb.select('row_to_json(row)', 'likesInfo').from((fqb) => {
          return fqb
            .select()
            .fromDummy()
            .addSelect((qb1) => {
              return qb1
                .select('ple."likeStatus"', 'myStatus')
                .from(PostsCommentsLikesEntity, 'ple')
                .where('ple."commentId" = pc."_id"')
                .andWhere('ple."userId" = :userId', { userId: Number(userId) });
            })
            .addSelect((qb2) => {
              return qb2.select('count(*)').from(PostsCommentsLikesEntity, 'ple').where('ple."commentId" = pc."_id"').andWhere('ple."likeStatus" = 1');
            }, 'likesCount')
            .addSelect((qb3) => {
              return qb3.select('count(*)').from(PostsCommentsLikesEntity, 'ple').where('ple."commentId" = pc."_id"').andWhere('ple."likeStatus" = 0');
            }, 'dislikesCount');
        }, 'row');
      })
      .addSelect((qb) => {
        return qb.select('row_to_json(row)', 'commentatorInfo').from((fqb) => {
          return fqb.select('pu."_id"', 'userId').addSelect('pu."login"', 'userLogin').from(UsersEntity, 'pu').where(`pu."_id" = pc."userId"`);
        }, 'row');
      })
      .where('pc."_id" = :commentId', { commentId: Number(commentId) });

    const result = await queryBuilder.getRawOne<ICommentSqlRaw>();

    if (result) {
      return CommentsSqlRawDataMapper.toCommentView(result);
    }
    return null;
  }
}
