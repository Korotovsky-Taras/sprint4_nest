import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IAuthSession } from '../../types/dao';
import { AuthSessionCreateModel, AuthSessionUpdateModel } from '../../types/dto';

@Schema()
export class AuthSession implements IAuthSession {
  @Prop({ required: true })
  deviceId: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  uuid: string;

  @Prop({ required: true })
  ip: string;

  @Prop({ required: true })
  userAgent: string;

  @Prop({ required: true })
  lastActiveDate: Date;

  constructor(input: AuthSessionCreateModel) {
    this.deviceId = input.deviceId;
    this.userId = input.userId;
    this.userAgent = input.userAgent;
    this.ip = input.ip;
    this.uuid = input.uuid;
    this.lastActiveDate = input.lastActiveDate;
  }

  updateSession(input: AuthSessionUpdateModel) {
    this.ip = input.ip;
    this.userAgent = input.userAgent;
    this.uuid = input.uuid;
    this.lastActiveDate = input.lastActiveDate;
  }

  static createAuthSession(input: AuthSessionCreateModel) {
    return new this(input);
  }
}

export const AuthSessionSchema = SchemaFactory.createForClass(AuthSession);

AuthSessionSchema.methods = {
  updateSession: AuthSession.prototype.updateSession,
};

AuthSessionSchema.statics = {
  createAuthSession: AuthSession.createAuthSession,
};
