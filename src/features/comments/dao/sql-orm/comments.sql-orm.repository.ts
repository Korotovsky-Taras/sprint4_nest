import { Injectable } from '@nestjs/common';
import { ICommentsRepository } from '../../types/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CommentUpdateDto } from '../../dto/CommentUpdateDto';
import { CommentCreateModel } from '../../types/dto';
import { LikeStatus } from '../../../likes/types';
import { PostsCommentsEntity } from './entities/posts-comments.entity';
import { PostsCommentsLikesEntity } from './entities/posts-comments-likes.entity';
import { isNumber } from 'class-validator';

@Injectable()
export class CommentsSqlOrmRepository implements ICommentsRepository<PostsCommentsEntity> {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(PostsCommentsEntity) private commentsRepo: Repository<PostsCommentsEntity>,
    @InjectRepository(PostsCommentsLikesEntity) private commentsLikesRepo: Repository<PostsCommentsLikesEntity>,
  ) {}

  async updateCommentById(commentId: string, input: CommentUpdateDto): Promise<boolean> {
    if (!isNumber(Number(commentId))) {
      return false;
    }
    const comment: PostsCommentsEntity | null = await this.commentsRepo.findOne({ where: { _id: Number(commentId) } });
    if (comment == null) {
      return false;
    }

    comment.content = input.content;
    await this.saveDoc(comment);
    return true;
  }

  async createComment(dto: CommentCreateModel): Promise<string> {
    const comment: PostsCommentsEntity = PostsCommentsEntity.createComment(dto);
    await this.saveDoc(comment);
    return String(comment._id);
  }

  async updateLike(commentId: string, userId: string, status: LikeStatus): Promise<boolean> {
    if (!isNumber(Number(commentId))) {
      return false;
    }

    if (status === LikeStatus.NONE) {
      const res = await this.commentsLikesRepo
        .createQueryBuilder()
        .delete()
        .from(PostsCommentsLikesEntity)
        .where({ commentId: Number(commentId), userId: Number(userId) })
        .execute();

      return res.affected != null && res.affected > 0;
    }

    let commentLike: PostsCommentsLikesEntity | null = await this.commentsLikesRepo.findOne({
      where: { commentId: Number(commentId), userId: Number(userId) },
    });

    const nextStatus = status === LikeStatus.DISLIKE ? 0 : 1;

    if (commentLike == null) {
      commentLike = new PostsCommentsLikesEntity();
      commentLike.userId = Number(userId);
      commentLike.commentId = Number(commentId);
    }
    commentLike.likeStatus = nextStatus;

    await this.commentsLikesRepo.save(commentLike);
    return true;
  }

  async deleteCommentById(commentId: string): Promise<boolean> {
    if (!isNumber(Number(commentId))) {
      return false;
    }

    const res = await this.commentsRepo
      .createQueryBuilder()
      .delete()
      .from(PostsCommentsEntity)
      .where({ _id: Number(commentId) })
      .execute();

    return res.affected != null && res.affected > 0;
  }

  async isCommentExist(commentId: string): Promise<boolean> {
    if (!isNumber(Number(commentId))) {
      return false;
    }

    const comment: PostsCommentsEntity | null = await this.commentsRepo.findOne({ where: { _id: Number(commentId) } });
    return comment != null;
  }

  async isUserCommentOwner(commentId: string, userId: string): Promise<boolean> {
    if (!isNumber(Number(commentId))) {
      return false;
    }
    const comment: PostsCommentsEntity | null = await this.commentsRepo.findOne({ where: { _id: Number(commentId), userId: Number(userId) } });
    return comment != null;
  }

  async saveDoc(doc: PostsCommentsEntity): Promise<void> {
    await this.commentsRepo.save(doc);
  }

  async clear(): Promise<void> {
    await this.commentsRepo.createQueryBuilder().delete().from(PostsCommentsEntity).where('1=1').execute();
  }
}
