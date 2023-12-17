import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UsersEntity } from '../../../users/dao/sql-orm/entities/users.entity';
import { AuthSessionCreateModel, AuthSessionUpdateModel } from '../../types/dto';

@Entity({ name: 'AuthSession' })
export class AuthEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column()
  userId: number;

  @Column({ type: 'uuid' })
  deviceId: string;

  @Column({ type: 'uuid' })
  uuid: string;

  @Column()
  ip: string;

  @Column()
  userAgent: string;

  @Column({ type: 'timestamp with time zone' })
  lastActiveDate: Date;

  @OneToOne(() => UsersEntity, (user) => user.auth, { cascade: ['insert', 'update'] })
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;

  static createSession(model: AuthSessionCreateModel): AuthEntity {
    const session: AuthEntity = new this();

    session.userId = Number(model.userId);
    session.deviceId = model.deviceId;
    session.uuid = model.uuid;
    session.ip = model.ip;
    session.userAgent = model.userAgent;
    session.lastActiveDate = model.lastActiveDate;
    return session;
  }

  updateSession(model: AuthSessionUpdateModel) {
    this.ip = model.ip;
    this.userAgent = model.userAgent;
    this.uuid = model.uuid;
    this.lastActiveDate = model.lastActiveDate;
  }
}
