import { Inject, Injectable } from '@nestjs/common';
import { ICommentsRepository } from '../../types/common';
import { InjectModel } from '@nestjs/mongoose';
import { Comment } from './comments.schema';
import { CommentDocumentType, CommentMongoType, ICommentModel } from '../../types/dao';
import { DeleteResult, ObjectId, UpdateResult } from 'mongodb';
import { CommentUpdateDto } from '../../dto/CommentUpdateDto';
import { CommentCreateModel } from '../../types/dto';
import { LikeStatus } from '../../../likes/types';
import { Error } from 'mongoose';
import { IUsersRepository, UserRepoKey } from '../../../users/types/common';
import { UserEntityRepo } from '../../../users/dao/user-entity.repo';

@Injectable()
export class CommentsMongoRepository implements ICommentsRepository {
  constructor(
    @InjectModel(Comment.name) private commentModel: ICommentModel,
    @Inject(UserRepoKey) private usersRepo: IUsersRepository,
  ) {}

  async updateCommentById(commentId: string, input: CommentUpdateDto): Promise<boolean> {
    const res: UpdateResult = await this.commentModel.updateOne({ _id: new ObjectId(commentId) }, { $set: input }).exec();
    return res.modifiedCount > 0;
  }

  async createComment(dto: CommentCreateModel): Promise<string> {
    const comment: CommentDocumentType = this.commentModel.createComment(dto);
    await this.saveDoc(comment);
    return comment._id.toString();
  }

  async updateLike(commentId: string, userId: string, status: LikeStatus): Promise<boolean> {
    const comment: CommentDocumentType | null = await this.commentModel.findOne({ _id: new ObjectId(commentId) }).exec();
    const user: UserEntityRepo | null = await this.usersRepo.getUserById(userId);
    if (!user || !comment) {
      throw new Error(`Comment -> update like data error`);
    }
    await comment.updateLike(userId, user.login, status);
    return true;
  }

  async deleteCommentById(commentId: string): Promise<boolean> {
    const res: DeleteResult = await this.commentModel.deleteOne({ _id: new ObjectId(commentId) }).exec();
    return res.deletedCount > 0;
  }

  async isCommentExist(commentId: string): Promise<boolean> {
    const comment: CommentDocumentType | null = await this.commentModel.findOne({ _id: new ObjectId(commentId) }).exec();
    return !!comment;
  }

  async isUserCommentOwner(commentId: string, userId: string): Promise<boolean> {
    const query = this.commentModel.where({ _id: new ObjectId(commentId) }).where({ 'commentatorInfo.userId': userId });
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
