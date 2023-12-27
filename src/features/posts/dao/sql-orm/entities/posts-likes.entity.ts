import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UsersEntity } from '../../../../users/dao/sql-orm/entities/users.entity';
import { PostsEntity } from './posts.entity';

@Entity({ name: 'PostsLikes' })
export class PostsLikesEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column()
  userId: number;

  @Column()
  postId: number;

  @Column()
  @Check(`"likeStatus" = ANY (ARRAY[0, 1])`)
  likeStatus: number;

  @Column({ type: 'timestamp with time zone', default: () => 'now()' })
  createdAt: Date;

  @ManyToOne(() => UsersEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;

  @ManyToOne(() => PostsEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'postId' })
  post: PostsEntity;
}
