import { Injectable } from '@nestjs/common';
import { IPostsQueryRepository } from '../../types/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { PostPaginationQueryDto } from '../../dto/PostPaginationQueryDto';
import { UserIdReq, WithPagination } from '../../../../application/utils/types';
import { PostViewModel } from '../../types/dto';
import { IPostSqlRaw } from '../../types/dao';
import { PostsEntity } from './entities/posts.entity';
import { withSqlOrmPagination } from '../../../../application/utils/withSqlOrmPagination';
import { PostsSqlOrmDataMapper } from './posts.sql-orm.dm';
import { PostsLikesEntity } from './entities/posts-likes.entity';

@Injectable()
export class PostsSqlOrmQueryRepository implements IPostsQueryRepository {
  constructor(
    @InjectRepository(PostsEntity) private postsRepo: Repository<PostsEntity>,
    @InjectEntityManager() private manager: EntityManager,
  ) {}

  async getBlogPosts(userId: UserIdReq, blogId: string, query: PostPaginationQueryDto): Promise<WithPagination<PostViewModel>> {
    const qb = this.manager.createQueryBuilder();

    const queryBuilder = qb.select('res.*').from((subQuery) => {
      return subQuery
        .select('p.*')
        .addSelect(`pb."_id"`, 'blogId')
        .addSelect(`pb.name`, 'blogName')
        .addSelect((qb) => {
          return qb.select('row_to_json(row)', 'likesInfo').from((fqb) => {
            return fqb
              .select()
              .fromDummy()
              .addSelect((qb1) => {
                return qb1
                  .select('ple."likeStatus"', 'myStatus')
                  .from(PostsLikesEntity, 'ple')
                  .where('ple."postId" = p."_id"')
                  .andWhere('ple."userId" = :userId', { userId: Number(userId) });
              })
              .addSelect((qb2) => {
                return qb2.select('count(*)').from(PostsLikesEntity, 'ple').where('ple."postId" = p."_id"').andWhere('ple."likeStatus" = 1');
              }, 'likesCount')
              .addSelect((qb3) => {
                return qb3.select('count(*)').from(PostsLikesEntity, 'ple').where('ple."postId" = p."_id"').andWhere('ple."likeStatus" = 0');
              }, 'dislikesCount');
          }, 'row');
        })
        .addSelect((qb) => {
          return qb.select(`jsonb_agg(row_to_json(row))`, 'lastLikes').from((qb3) => {
            return qb3
              .select('ple."createdAt"')
              .addSelect('ple_u."login"', 'userLogin')
              .addSelect('ple_u."_id"', 'userId')
              .from(PostsLikesEntity, 'ple')
              .where('ple."postId" = p."_id"')
              .andWhere('ple."likeStatus" = 1')
              .leftJoin('ple.user', 'ple_u')
              .orderBy('ple."createdAt"', 'DESC')
              .limit(3);
          }, 'row');
        })
        .from(PostsEntity, 'p')
        .leftJoin('p.blog', 'pb')
        .leftJoin('p.postLikes', 'pl')
        .where('p."blogId" = :blogId', { blogId: Number(blogId) })
        .groupBy('p."_id", pb."_id"');
    }, 'res');

    const sortByWithCollate = query.sortBy !== 'createdAt' ? 'COLLATE "C"' : '';

    return withSqlOrmPagination<IPostSqlRaw, PostViewModel>(queryBuilder, query, sortByWithCollate, (items) => {
      return PostsSqlOrmDataMapper.toPostsView(items);
    });
  }

  async getAllPosts(userId: UserIdReq, query: PostPaginationQueryDto): Promise<WithPagination<PostViewModel>> {
    const qb = this.manager.createQueryBuilder();

    const queryBuilder = qb.select('res.*').from((subQuery) => {
      return subQuery
        .select('p.*')
        .addSelect(`pb."_id"`, 'blogId')
        .addSelect(`pb.name`, 'blogName')
        .addSelect((qb) => {
          return qb.select('row_to_json(row)', 'likesInfo').from((fqb) => {
            return fqb
              .select()
              .fromDummy()
              .addSelect((qb1) => {
                return qb1
                  .select('ple."likeStatus"', 'myStatus')
                  .from(PostsLikesEntity, 'ple')
                  .where('ple."postId" = p."_id"')
                  .andWhere('ple."userId" = :userId', { userId: Number(userId) });
              })
              .addSelect((qb2) => {
                return qb2.select('count(*)').from(PostsLikesEntity, 'ple').where('ple."postId" = p."_id"').andWhere('ple."likeStatus" = 1');
              }, 'likesCount')
              .addSelect((qb3) => {
                return qb3.select('count(*)').from(PostsLikesEntity, 'ple').where('ple."postId" = p."_id"').andWhere('ple."likeStatus" = 0');
              }, 'dislikesCount');
          }, 'row');
        })
        .addSelect((qb) => {
          return qb.select(`jsonb_agg(row_to_json(row))`, 'lastLikes').from((qb3) => {
            return qb3
              .select('ple."createdAt"')
              .addSelect('ple_u."login"', 'userLogin')
              .addSelect('ple_u."_id"', 'userId')
              .from(PostsLikesEntity, 'ple')
              .where('ple."postId" = p."_id"')
              .andWhere('ple."likeStatus" = 1')
              .leftJoin('ple.user', 'ple_u')
              .orderBy('ple."createdAt"', 'DESC')
              .limit(3);
          }, 'row');
        })
        .from(PostsEntity, 'p')
        .leftJoin('p.blog', 'pb')
        .leftJoin('p.postLikes', 'pl')
        .groupBy('p."_id", pb."_id"');
    }, 'res');

    const sortByWithCollate = query.sortBy !== 'createdAt' ? 'COLLATE "C"' : '';

    return withSqlOrmPagination<IPostSqlRaw, PostViewModel>(queryBuilder, query, sortByWithCollate, (items) => {
      return PostsSqlOrmDataMapper.toPostsView(items);
    });
  }

  async getPostById(userId: UserIdReq, postId: string): Promise<PostViewModel | null> {
    const queryBuilder = this.postsRepo.createQueryBuilder('p');

    const res = await queryBuilder
      .leftJoin('p.blog', 'pb')
      .leftJoin('p.postLikes', 'pl')
      .select('p.*')
      .addSelect(`pb."_id"`, 'blogId')
      .addSelect(`pb.name`, 'blogName')
      .addSelect((qb) => {
        return qb.select('row_to_json(row)', 'likesInfo').from((fqb) => {
          return fqb
            .select()
            .fromDummy()
            .addSelect((qb1) => {
              return qb1
                .select('ple."likeStatus"', 'myStatus')
                .from(PostsLikesEntity, 'ple')
                .where('ple."postId" = p."_id"')
                .andWhere('ple."userId" = :userId', { userId: Number(userId) });
            })
            .addSelect((qb2) => {
              return qb2.select('count(*)').from(PostsLikesEntity, 'ple').where('ple."postId" = p."_id"').andWhere('ple."likeStatus" = 1');
            }, 'likesCount')
            .addSelect((qb3) => {
              return qb3.select('count(*)').from(PostsLikesEntity, 'ple').where('ple."postId" = p."_id"').andWhere('ple."likeStatus" = 0');
            }, 'dislikesCount');
        }, 'row');
      })
      .addSelect((qb) => {
        return qb.select(`jsonb_agg(row_to_json(row))`, 'lastLikes').from((qb3) => {
          return qb3
            .select('ple."createdAt"')
            .addSelect('ple_u."login"', 'userLogin')
            .addSelect('ple_u."_id"', 'userId')
            .from(PostsLikesEntity, 'ple')
            .where('ple."postId" = p."_id"')
            .andWhere('ple."likeStatus" = 1')
            .leftJoin('ple.user', 'ple_u')
            .orderBy('ple."createdAt"', 'DESC')
            .limit(3);
        }, 'row');
      })
      .where('p."_id" = :postId', { postId: Number(postId) })
      .getRawMany<IPostSqlRaw>();

    if (res.length > 0) {
      return PostsSqlOrmDataMapper.toPostView(res[0]);
    }

    return null;
  }

  async isPostExist(postId: string): Promise<boolean> {
    const post: PostsEntity | null = await this.postsRepo.findOne({ where: { _id: Number(postId) } });
    return post != null;
  }
}
