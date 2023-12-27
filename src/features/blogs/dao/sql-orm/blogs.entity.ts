import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { PostsEntity } from '../../../posts/dao/sql-orm/entities/posts.entity';
import { BlogCreateDto } from '../../dto/BlogCreateDto';

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

  static createBlog(model: BlogCreateDto): BlogsEntity {
    const blog: BlogsEntity = new this();
    blog.name = model.name;
    blog.description = model.description;
    blog.websiteUrl = model.websiteUrl;
    return blog;
  }
}
