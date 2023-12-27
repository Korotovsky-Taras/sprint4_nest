import { Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UsersCredentialsEntity } from './users-credentials.entity';
import { UsersRecoveryConfirmationEntity } from './users-recovery-confirmation.entity';
import { UsersRegistrationConfirmationEntity } from './users-registration-confirmation.entity';
import { AuthEntity } from '../../../../auth/dao/sql-orm/auth.entity';
import { PostsCommentsEntity } from '../../../../comments/dao/sql-orm/entities/posts-comments.entity';
import { UserCreateInputModel } from '../../../types/dto';
import { IUser, UserConfirmation, UserEncodedPassword } from '../../../types/dao';
import { WithDbId } from '../../../../../application/utils/types';
import { PostsLikesEntity } from '../../../../posts/dao/sql-orm/entities/posts-likes.entity';

@Entity({ name: 'Users' })
export class UsersEntity implements WithDbId<IUser> {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column()
  login: string;

  @Column()
  email: string;

  @Column({ type: 'timestamp with time zone', default: () => 'now()' })
  createdAt: Date;

  @OneToMany(() => PostsCommentsEntity, (postComments) => postComments.user)
  postComments: PostsCommentsEntity[];

  @OneToMany(() => PostsLikesEntity, (postLikes) => postLikes.user)
  postLikes: PostsLikesEntity[];

  @OneToMany(() => AuthEntity, (auth) => auth.user)
  auth: AuthEntity;

  @OneToOne(() => UsersCredentialsEntity, (credentials) => credentials.user, { cascade: ['insert', 'update'] })
  password: UsersCredentialsEntity;

  @OneToOne(() => UsersRecoveryConfirmationEntity, (confirmation) => confirmation.user, { cascade: ['insert', 'update'] })
  passConfirmation: UsersRecoveryConfirmationEntity;

  @OneToOne(() => UsersRegistrationConfirmationEntity, (confirmation) => confirmation.user, { cascade: ['insert', 'update'] })
  authConfirmation: UsersRegistrationConfirmationEntity;

  isAuthConfirmed(): boolean {
    return this.authConfirmation.confirmed;
  }

  isAuthExpired(): boolean {
    return new Date().getTime() > new Date(this.authConfirmation.expiredIn).getTime();
  }

  isPassConfirmed(): boolean {
    return this.authConfirmation.confirmed;
  }

  isPassExpired(): boolean {
    return new Date().getTime() > new Date(this.passConfirmation.expiredIn).getTime();
  }

  setPassword(password: UserEncodedPassword): void {
    this.password.hash = password.hash;
    this.password.salt = password.salt;
  }

  setAuthConfirmed(confirm: boolean): void {
    this.authConfirmation.confirmed = confirm;
  }

  setPassConfirmed(confirm: boolean): void {
    this.authConfirmation.confirmed = confirm;
  }

  setAuthConfirmation(conf: UserConfirmation): void {
    if (!this.authConfirmation) {
      this.authConfirmation = new UsersRecoveryConfirmationEntity();
    }
    this.authConfirmation.code = conf.code;
    this.authConfirmation.confirmed = conf.confirmed;
    this.authConfirmation.expiredIn = conf.expiredIn;
  }

  setPassConfirmation(conf: UserConfirmation): void {
    if (!this.passConfirmation) {
      this.passConfirmation = new UsersRegistrationConfirmationEntity();
    }
    this.passConfirmation.code = conf.code;
    this.passConfirmation.confirmed = conf.confirmed;
    this.passConfirmation.expiredIn = conf.expiredIn;
  }

  static createUser(model: UserCreateInputModel): UsersEntity {
    const user = new this();

    const credentials = new UsersCredentialsEntity();
    credentials.salt = model.password.salt;
    credentials.hash = model.password.hash;

    const registrationConfirmation = new UsersRegistrationConfirmationEntity();
    registrationConfirmation.code = model.authConfirmation.code;
    registrationConfirmation.expiredIn = model.authConfirmation.expiredIn;
    registrationConfirmation.confirmed = model.authConfirmation.confirmed;

    user.login = model.login;
    user.email = model.email;
    user.password = credentials;
    user.authConfirmation = registrationConfirmation;
    return user;
  }
}
