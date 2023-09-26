import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { CommentCommentatorInfo, IComment } from '../types/dao';
import { CommentCreateDto } from '../types/dto';
import { WithLikes } from '../../likes/withLikes.schema';

@Schema({ timestamps: true })
export class Comment extends WithLikes implements IComment {
  constructor(input: CommentCreateDto) {
    super();
    this.postId = input.postId;
    this.content = input.content;
    this.commentatorInfo = input.commentatorInfo;
  }

  @Prop({ required: true })
  postId: string;

  @Prop({ required: true })
  content: string;

  @Prop({
    type: {
      userId: { type: String, required: true },
      userLogin: { type: String, required: true },
    },
  })
  commentatorInfo: CommentCommentatorInfo;

  createdAt: Date;

  static createComment(input: CommentCreateDto) {
    return new this(input);
  }
}

export const CommentsSchema = SchemaFactory.createForClass(Comment);

CommentsSchema.methods = {
  updateLike: Comment.prototype.updateLike,
};

CommentsSchema.statics = {
  createComment: Comment.createComment,
};
