import { Check, Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { POST_CONTENT_MAX, POST_DESCRIPTION_MAX, POST_TITLE_MAX } from '../../../dto/dto.variables';
import { BlogsEntity } from '../../../../blogs/dao/sql-orm/blogs.entity';
import { PostsCommentsEntity } from '../../../../comments/dao/sql-orm/entities/posts-comments.entity';
import { PostsLikesEntity } from './posts-likes.entity';
import { PostCreateModel } from '../../../types/dto';

@Entity({ name: 'Posts' })
export class PostsEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column()
  blogId: number;

  @Column()
  @Check(`length(("title")::text) <= ${POST_TITLE_MAX}`)
  title: string;

  @Column()
  @Check(`length(("shortDescription")::text) <= ${POST_DESCRIPTION_MAX}`)
  shortDescription: string;

  @Column()
  @Check(`length(("content")::text) <= ${POST_CONTENT_MAX}`)
  content: string;

  @Column({ type: 'timestamp with time zone', default: () => 'now()' })
  createdAt: Date;

  @OneToMany(() => PostsLikesEntity, (postLikes) => postLikes.post, { cascade: ['insert', 'update'] })
  postLikes: PostsLikesEntity[];

  @OneToMany(() => PostsCommentsEntity, (postComments) => postComments.post, { cascade: ['insert', 'update'] })
  postComments: PostsCommentsEntity[];

  @ManyToOne(() => BlogsEntity, (blog) => blog.posts, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'blogId' })
  blog: BlogsEntity;

  static createPost(model: PostCreateModel): PostsEntity {
    const post: PostsEntity = new this();
    post.title = model.title;
    post.shortDescription = model.shortDescription;
    post.content = model.content;
    post.blogId = Number(model.blogId);
    return post;
  }
}
