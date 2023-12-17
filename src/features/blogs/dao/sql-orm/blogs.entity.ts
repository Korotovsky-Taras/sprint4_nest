import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PostsEntity } from '../../../posts/dao/sql-orm/entities/posts.entity';

@Entity({ name: 'Blogs' })
export class BlogsEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column()
  name: string;

  @Column()
  websiteUrl: string;

  @Column({ type: 'boolean', default: false })
  isMembership: boolean;

  @Column()
  description: string;

  @Column({ type: 'timestamp with time zone', default: () => 'now()' })
  createdAt: Date;

  @OneToMany(() => PostsEntity, (post) => post.blog, { cascade: true })
  posts: PostsEntity[];
}
