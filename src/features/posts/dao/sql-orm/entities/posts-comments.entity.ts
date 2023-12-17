import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { COMMENT_CONTENT_MAX, COMMENT_CONTENT_MIN } from '../../../dto/dto.variables';
import { PostsEntity } from './posts.entity';
import { UsersEntity } from '../../../../users/dao/sql-orm/entities/users.entity';

@Entity({ name: 'PostsComments' })
export class PostsCommentsEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column()
  userId: number;

  @Column()
  postId: number;

  @Column()
  @Check(`length(("content")::text) > ${COMMENT_CONTENT_MIN} AND length(("content")::text) < ${COMMENT_CONTENT_MAX}`)
  content: string;

  @Column({ type: 'timestamp with time zone', default: () => 'now()' })
  createdAt: Date;

  @ManyToOne(() => UsersEntity, (user) => user.postComments)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;

  @ManyToOne(() => PostsEntity, (post) => post.postComments)
  @JoinColumn({ name: 'postId' })
  post: PostsEntity;
}
