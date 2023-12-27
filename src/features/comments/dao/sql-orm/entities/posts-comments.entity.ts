import { Check, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { COMMENT_CONTENT_MAX, COMMENT_CONTENT_MIN } from '../../../../posts/dto/dto.variables';
import { PostsEntity } from '../../../../posts/dao/sql-orm/entities/posts.entity';
import { UsersEntity } from '../../../../users/dao/sql-orm/entities/users.entity';
import { PostsCommentsLikesEntity } from './posts-comments-likes.entity';
import { CommentCreateModel } from '../../../types/dto';

@Entity({ name: 'PostsComments' })
export class PostsCommentsEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column()
  userId: number;

  @Column()
  postId: number;

  @Column()
  @Check(`length(("content")::text) >= ${COMMENT_CONTENT_MIN} AND length(("content")::text) <= ${COMMENT_CONTENT_MAX}`)
  content: string;

  @Column({ type: 'timestamp with time zone', default: () => 'now()' })
  createdAt: Date;

  @ManyToOne(() => UsersEntity, (user) => user.postComments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;

  @ManyToOne(() => PostsEntity, (post) => post.postComments, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: PostsEntity;

  @OneToMany(() => PostsCommentsLikesEntity, (likes) => likes.comment, { onDelete: 'CASCADE' })
  likes: PostsCommentsLikesEntity;

  static createComment(model: CommentCreateModel): PostsCommentsEntity {
    const comment = new this();
    comment.postId = Number(model.postId);
    comment.content = model.content;
    comment.userId = Number(model.commentatorInfo.userId);
    return comment;
  }
}
