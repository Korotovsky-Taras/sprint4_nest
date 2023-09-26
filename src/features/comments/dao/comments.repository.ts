import { Injectable } from '@nestjs/common';
import { ICommentsRepository } from '../types/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from './comments.schema';
import { CommentDocumentType, ICommentModel } from '../types/dao';
import { CommentUpdateDto } from '../types/dto';
import { DeleteResult, ObjectId, UpdateResult } from 'mongodb';

@Injectable()
export class CommentsRepository implements ICommentsRepository {
  constructor(@InjectModel(Comment.name) private commentModel: ICommentModel) {}

  async updateCommentById(id: string, input: CommentUpdateDto): Promise<boolean> {
    const res: UpdateResult = await this.commentModel.updateOne({ _id: new ObjectId(id) }, { $set: input }).exec();
    return res.modifiedCount > 0;
  }
  async deleteCommentById(id: string): Promise<boolean> {
    const res: DeleteResult = await this.commentModel.deleteOne({ _id: new ObjectId(id) }).exec();
    return res.deletedCount > 0;
  }
  async saveDoc(doc: CommentDocumentType): Promise<void> {
    await doc.save();
  }
  async clear(): Promise<void> {
    await this.commentModel.deleteMany({});
  }
}
