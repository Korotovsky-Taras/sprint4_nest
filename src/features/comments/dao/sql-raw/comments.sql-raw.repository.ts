import { Injectable } from '@nestjs/common';
import { ICommentsRepository } from '../../types/common';
import { ICommentSqlRaw } from '../../types/dao';
import { CommentUpdateDto } from '../../dto/CommentUpdateDto';
import { CommentCreateModel } from '../../types/dto';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { LikeStatus } from '../../../likes/types';

@Injectable()
export class CommentsSqlRawRepository implements ICommentsRepository {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async updateCommentById(commentId: string, input: CommentUpdateDto): Promise<boolean> {
    const [, count] = await this.dataSource.query(`UPDATE public."PostsComments" as pc SET "content" = $2 WHERE pc."_id" = $1`, [commentId, input.content]);
    return count > 0;
  }

  async createComment(dto: CommentCreateModel): Promise<string> {
    const res = await this.dataSource.query<ICommentSqlRaw[]>(
      `INSERT INTO public."PostsComments" ("postId", "content", "userId") VALUES ($1, $2, $3) RETURNING "_id"`,
      [dto.postId, dto.content, dto.commentatorInfo.userId],
    );
    return String(res[0]._id);
  }

  async updateLike(userId: string, commentId: string, status: LikeStatus): Promise<boolean> {
    if (status === LikeStatus.NONE) {
      const [, count] = await this.dataSource.query(`DELETE FROM public."PostsCommentsLikes" as pc WHERE pc."userId" = $1 AND pc."_id" = $2`, [
        userId,
        commentId,
      ]);
      return count > 0;
    }

    const res = await this.dataSource.query(`SELECT * FROM public."PostsCommentsLikes" as pcl WHERE pcl."commentId" = $1 AND pcl."userId" = $2`, [
      commentId,
      userId,
    ]);

    if (res.length > 0) {
      const [, count] = await this.dataSource.query(
        `UPDATE public."PostsCommentsLikes" as pcl  SET "likeStatus"=$3 WHERE pcl."userId" = $1 AND pcl."commentId" = $2`,
        [userId, commentId, status === LikeStatus.DISLIKE ? 0 : 1],
      );
      return count > 0;
    }

    await this.dataSource.query(`INSERT INTO public."PostsCommentsLikes" as pc ("userId", "commentId", "likeStatus") VALUES ($1, $2, $3)`, [
      userId,
      commentId,
      status === LikeStatus.DISLIKE ? 0 : 1,
    ]);

    return true;
  }

  async deleteCommentById(PostsComments: string): Promise<boolean> {
    const [, count] = await this.dataSource.query(`DELETE FROM public."PostsComments" as pc WHERE pc."_id" = $1`, [PostsComments]);
    return count > 0;
  }

  async isCommentExist(commentId: string): Promise<boolean> {
    const res = await this.dataSource.query<ICommentSqlRaw[]>(`SELECT * FROM public."PostsComments" as pc WHERE pc."_id" = $1`, [commentId]);
    return res.length > 0;
  }

  async isUserCommentOwner(commentId: string, userId: string): Promise<boolean> {
    const res = await this.dataSource.query<ICommentSqlRaw[]>(`SELECT * FROM public."PostsComments" as pc WHERE pc."_id" = $1 AND pc."userId" = $2`, [
      commentId,
      userId,
    ]);
    return res.length > 0;
  }

  async saveDoc(): Promise<void> {}

  async clear(): Promise<void> {
    await this.dataSource.query(`TRUNCATE TABLE public."PostsComments" CASCADE`);
  }
}
