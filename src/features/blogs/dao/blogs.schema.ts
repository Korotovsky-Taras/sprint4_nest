import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IBlog } from '../types/dao';
import { BlogCreateDto } from '../types/dto';

@Schema({ timestamps: true })
export class Blog implements IBlog {
  constructor(input: BlogCreateDto) {
    this.name = input.name;
    this.description = input.description;
    this.websiteUrl = input.websiteUrl;
  }

  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  description: string;
  @Prop()
  websiteUrl: string;
  @Prop({ default: false })
  isMembership: boolean;

  createdAt: Date;

  static createBlog(input: BlogCreateDto) {
    return new this(input);
  }
}

export const BlogSchema = SchemaFactory.createForClass(Blog);

BlogSchema.methods = {};

BlogSchema.statics = {
  createBlog: Blog.createBlog,
};
