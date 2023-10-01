import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { PostCreateModel } from '../types/dto';
import { IPost } from '../types/dao';
import { WithLikes } from '../../likes/withLikes.schema';

@Schema({ timestamps: true })
export class Post extends WithLikes implements IPost {
  constructor(input: PostCreateModel) {
    super();
    this.blogId = input.blogId;
    this.blogName = input.blogName;
    this.title = input.title;
    this.content = input.content;
    this.shortDescription = input.shortDescription;
  }

  @Prop({ required: true })
  title: string;
  @Prop({ required: true })
  shortDescription: string;
  @Prop({ required: true })
  content: string;
  @Prop({ required: true })
  blogId: string;
  @Prop({ required: true })
  blogName: string;

  createdAt: Date;

  static createPost(input: PostCreateModel) {
    return new this(input);
  }
}

export const PostSchema = SchemaFactory.createForClass(Post);

PostSchema.methods = {
  updateLike: Post.prototype.updateLike,
};

PostSchema.statics = {
  createPost: Post.createPost,
};
