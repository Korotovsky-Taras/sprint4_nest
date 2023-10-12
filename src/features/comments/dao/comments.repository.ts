import { Injectable } from '@nestjs/common';
import { ICommentsRepository } from '../types/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from './comments.schema';
import { CommentDocumentType, CommentMongoType, ICommentModel } from '../types/dao';
import { DeleteResult, ObjectId, UpdateResult } from 'mongodb';
import { CommentUpdateDto } from '../dto/CommentUpdateDto';
import { CommentCreateDto } from '../types/dto';
import { LikeStatus } from '../../likes/types';

@Injectable()
export class CommentsRepository implements ICommentsRepository {
  constructor(@InjectModel(Comment.name) private commentModel: ICommentModel) {}

  async updateCommentById(id: string, input: CommentUpdateDto): Promise<boolean> {
    const res: UpdateResult = await this.commentModel.updateOne({ _id: new ObjectId(id) }, { $set: input }).exec();
    return res.modifiedCount > 0;
  }

  async createComment(dto: CommentCreateDto): Promise<string> {
    const comment: CommentDocumentType = this.commentModel.createComment(dto);
    await this.saveDoc(comment);
    return comment._id.toString();
  }

  async updateLike(commentId: string, userId: string, userLogin: string, likeStatus: LikeStatus): Promise<boolean> {
    const comment: CommentDocumentType | null = await this.commentModel.findOne({ _id: new ObjectId(commentId) }).exec();
    if (!comment) {
      return false;
    }
    comment.updateLike(userId, userLogin, likeStatus);
    await this.saveDoc(comment);
    return true;
  }

  async getCommentById(id: string): Promise<CommentMongoType | null> {
    return this.commentModel.findOne({ _id: new ObjectId(id) }).lean();
  }

  async deleteCommentById(id: string): Promise<boolean> {
    const res: DeleteResult = await this.commentModel.deleteOne({ _id: new ObjectId(id) }).exec();
    return res.deletedCount > 0;
  }

  async isCommentExist(id: string): Promise<boolean> {
    const comment: CommentDocumentType | null = await this.commentModel.findOne({ _id: new ObjectId(id) }).exec();
    return !!comment;
  }

  async isUserCommentOwner(id: string, userId: string): Promise<boolean> {
    const query = this.commentModel.where({ _id: new ObjectId(id) }).where({ 'commentatorInfo.userId': userId });
    const res: CommentMongoType | null = await query.findOne().lean();
    return !!res;
  }

  async saveDoc(doc: CommentDocumentType): Promise<void> {
    await doc.save();
  }
  async clear(): Promise<void> {
    await this.commentModel.deleteMany({});
  }
}
