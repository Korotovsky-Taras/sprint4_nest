import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IUser, UserConfirmation, UserEncodedPassword } from '../../types/dao';
import { UserCreateInputModel } from '../../types/dto';

@Schema({ timestamps: true })
export class User implements IUser {
  constructor(input: UserCreateInputModel) {
    this.login = input.login;
    this.email = input.email;
    this.password = input.password;
    this.authConfirmation = input.authConfirmation;
  }

  @Prop({ required: true })
  login: string;
  @Prop({ required: true })
  email: string;
  @Prop({
    type: {
      salt: { type: String, required: true },
      hash: { type: String, required: true },
    },
  })
  password: UserEncodedPassword;
  @Prop({
    type: {
      code: { type: String, required: true },
      confirmed: { type: Boolean, required: true },
      expiredIn: { type: Date, required: true },
    },
  })
  authConfirmation: UserConfirmation;
  @Prop({
    type: {
      code: { type: String },
      confirmed: { type: Boolean },
      expiredIn: { type: Date },
    },
  })
  passConfirmation: UserConfirmation;

  createdAt: Date;

  setPassword(password: UserEncodedPassword): void {
    this.password.hash = password.hash;
    this.password.salt = password.salt;
  }
  setAuthConfirmed(confirm: boolean): void {
    this.authConfirmation.confirmed = confirm;
  }
  setPassConfirmed(confirm: boolean): void {
    this.passConfirmation.confirmed = confirm;
  }
  isAuthConfirmed(): boolean {
    return this.authConfirmation.confirmed;
  }
  isAuthExpired(): boolean {
    return new Date().getTime() > new Date(this.authConfirmation.expiredIn).getTime();
  }
  isPassExpired(): boolean {
    return new Date().getTime() > new Date(this.passConfirmation.expiredIn).getTime();
  }

  setAuthConfirmation(conf: UserConfirmation): void {
    this.authConfirmation = {
      code: conf.code,
      confirmed: conf.confirmed,
      expiredIn: conf.expiredIn,
    };
  }
  setPassConfirmation(conf: UserConfirmation): void {
    this.passConfirmation = {
      code: conf.code,
      confirmed: conf.confirmed,
      expiredIn: conf.expiredIn,
    };
  }

  static createUser(input: UserCreateInputModel) {
    return new this(input);
  }
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.methods = {
  setPassword: User.prototype.setPassword,
  setAuthConfirmed: User.prototype.setAuthConfirmed,
  setAuthConfirmation: User.prototype.setAuthConfirmation,
  setPassConfirmed: User.prototype.setPassConfirmed,
  setPassConfirmation: User.prototype.setPassConfirmation,
  isAuthConfirmed: User.prototype.isAuthConfirmed,
  isAuthExpired: User.prototype.isAuthExpired,
  isPassExpired: User.prototype.isPassExpired,
};

UserSchema.statics = {
  createUser: User.createUser,
};
