import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { PostsCommentsEntity } from './posts-comments.entity';
import { UsersEntity } from '../../../../users/dao/sql-orm/entities/users.entity';

@Entity({ name: 'PostsCommentsLikes' })
export class PostsCommentsLikesEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column()
  userId: number;

  @Column()
  commentId: number;

  @Column()
  @Check(`"likeStatus" = ANY (ARRAY[0, 1])`)
  likeStatus: number;

  @Column({ type: 'timestamp with time zone', default: () => 'now()' })
  createdAt: Date;

  @ManyToOne(() => PostsCommentsEntity, (comment) => comment.likes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'commentId' })
  comment: PostsCommentsEntity;

  @ManyToOne(() => UsersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;
}
