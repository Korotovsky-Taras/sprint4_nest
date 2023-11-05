import { Injectable } from '@nestjs/common';
import { IPostSqlRaw, PostDBType } from '../../types/dao';
import { IPostsRepository } from '../../types/common';
import { PostCreateModel, PostViewModel } from '../../types/dto';
import { PostUpdateDto } from '../../dto/PostUpdateDto';
import { LikeStatus } from '../../../likes/types';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { PostsSqlRawDataMapper } from '../../api/posts.sql-raw.dm';

@Injectable()
export class PostsSqlRawRepository implements IPostsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async createPost(input: PostCreateModel): Promise<PostViewModel> {
    const res = await this.dataSource.query<IPostSqlRaw[]>(
      `INSERT INTO public."Posts" as p ("blogId", title, "shortDescription", "content")
VALUES ($1, $2, $3, $4)
RETURNING *, (SELECT b."name" as "blogName" FROM public."Blogs" as b WHERE b._id = p."blogId")`,
      [input.blogId, input.title, input.shortDescription, input.content],
    );

    return PostsSqlRawDataMapper.toPostView({
      ...res[0],
      blogId: Number(input.blogId),
      likesInfo: {
        likesCount: 0,
        dislikesCount: 0,
        myStatus: null,
      },
      lastLikes: [],
    });
  }

  async updatePostById(id: string, dto: PostUpdateDto): Promise<boolean> {
    const [, count] = await this.dataSource.query(
      `UPDATE public."Posts" as p SET "title"=$3, "shortDescription"=$4, "content"=$4 WHERE p."_id" = $1 AND p."blogId" = $2`,
      [id, dto.blogId, dto.title, dto.shortDescription, dto.content],
    );
    return count > 0;
  }

  async updateLike(postId: string, status: LikeStatus, userId: string): Promise<boolean> {
    if (status === LikeStatus.NONE) {
      const [, count] = await this.dataSource.query(`DELETE FROM public."PostsLikes" as p WHERE p."_id" = $1 AND p."userId" = $2`, [postId, userId]);
      return count > 0;
    }

    const res = await this.dataSource.query(`SELECT * FROM public."PostsLikes" as pcl WHERE pcl."postId" = $1 AND pcl."userId" = $2`, [postId, userId]);

    const nextStatus = status === LikeStatus.DISLIKE ? 0 : 1;

    if (res.length > 0) {
      const [, count] = await this.dataSource.query(`UPDATE public."PostsLikes" as pcl  SET "likeStatus"=$3 WHERE pcl."userId" = $1 AND pcl."postId" = $2`, [
        userId,
        postId,
        nextStatus,
      ]);
      return count > 0;
    }

    await this.dataSource.query(`INSERT INTO public."PostsLikes" as pc ("userId", "postId", "likeStatus") VALUES ($1, $2, $3)`, [userId, postId, nextStatus]);

    return true;
  }

  async isPostExist(id: string): Promise<boolean> {
    const res = await this.dataSource.query<PostDBType[]>(`SELECT "_id" FROM public."Posts" as p WHERE p."_id" = $1 `, [id]);
    return !!res[0];
  }

  async getPostById(id: string): Promise<PostDBType | null> {
    const res = await this.dataSource.query<PostDBType[]>(`SELECT "_id" FROM public."Posts" as p WHERE p."_id" = $1 `, [id]);
    const post = res[0];
    if (post) {
      return post;
    }
    return null;
  }

  async deletePostById(id: string): Promise<boolean> {
    const [, count] = await this.dataSource.query(`DELETE FROM public."Posts" as p WHERE p."_id" = $1`, [id]);
    return count > 0;
  }

  async saveDoc(): Promise<void> {}

  async clear(): Promise<void> {
    await this.dataSource.query(`TRUNCATE TABLE public."Posts" CASCADE`);
  }
}