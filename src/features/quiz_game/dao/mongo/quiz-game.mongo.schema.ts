import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IQuizGame, QuizGameStatus } from '../../types/dao';
import { ObjectId } from 'mongodb';
import { SchemaTypes } from 'mongoose';

@Schema({ timestamps: true })
export class QuizGame implements IQuizGame<ObjectId, ObjectId> {
  @Prop({ type: [SchemaTypes.ObjectId], ref: 'Users', default: [] })
  players;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'QuizGamePlayerProgress', default: null })
  firstPlayerProgress;

  @Prop({ type: SchemaTypes.ObjectId, ref: 'QuizGamePlayerProgress', default: null })
  secondPlayerProgress;

  @Prop({
    type: [SchemaTypes.ObjectId],
    ref: 'QuizGameQuestion',
    default: null,
  })
  questions;

  @Prop({ type: Number, enum: QuizGameStatus })
  status: QuizGameStatus;

  @Prop({ default: null })
  startGameDate: Date;

  @Prop({ default: null })
  finishGameDate: Date;

  createdAt: Date;

  applyFirstPlayer(playerProgressId: ObjectId, playerId: ObjectId) {
    this.firstPlayerProgress = playerProgressId;
    this.status = QuizGameStatus.PendingSecondPlayer;
    this.players.push(playerId);
  }

  applySecondPlayer(playerProgressId: ObjectId, playerId: ObjectId) {
    this.secondPlayerProgress = playerProgressId;
    this.players.push(playerId);
  }

  applyQuestions(objectIds: ObjectId[]) {
    this.questions = objectIds;
  }

  startGame() {
    this.startGameDate = new Date();
    this.status = QuizGameStatus.Active;
  }

  finishGame() {
    this.finishGameDate = new Date();
    this.status = QuizGameStatus.Finished;
  }

  static createGame() {
    const game = new this();
    return game;
  }
}

export const QuizGameSchema = SchemaFactory.createForClass(QuizGame);

QuizGameSchema.methods = {
  applyFirstPlayer: QuizGame.prototype.applyFirstPlayer,
  applySecondPlayer: QuizGame.prototype.applySecondPlayer,
  applyQuestions: QuizGame.prototype.applyQuestions,
  startGame: QuizGame.prototype.startGame,
  finishGame: QuizGame.prototype.finishGame,
};

QuizGameSchema.statics = {
  createGame: QuizGame.createGame,
};
