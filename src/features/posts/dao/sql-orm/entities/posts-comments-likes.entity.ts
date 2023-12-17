import { Check, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { POST_CONTENT_MAX, POST_DESCRIPTION_MAX, POST_TITLE_MAX } from '../../../dto/dto.variables';
import { BlogsEntity } from '../../../../blogs/dao/sql-orm/blogs.entity';

@Entity({ name: 'PostsCommentsLikes' })
export class PostsCommentsLikesEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  // TODO ? PrimaryColumn?
  @Column()
  blogId: number;

  @Column()
  @Check(`length(("title")::text) < ${POST_TITLE_MAX}`)
  title: string;

  @Column()
  @Check(`length(("shortDescription")::text) < ${POST_DESCRIPTION_MAX}`)
  shortDescription: string;

  @Column()
  @Check(`length(("content")::text) < ${POST_CONTENT_MAX}`)
  content: string;

  @Column({ type: 'timestamp with time zone', default: () => 'now()' })
  createdAt: Date;

  @ManyToOne(() => BlogsEntity, (blog) => blog.posts)
  @JoinColumn({ name: 'blogId' })
  blog: BlogsEntity;
}
