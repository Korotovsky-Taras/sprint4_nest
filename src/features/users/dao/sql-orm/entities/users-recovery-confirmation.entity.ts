import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UsersEntity } from './users.entity';

@Entity({ name: 'UsersRecoveryConfirmation' })
export class UsersRecoveryConfirmationEntity {
  @PrimaryColumn()
  userId: number;

  @Column()
  code: string;

  @Column()
  confirmed: boolean;

  @Column({ type: 'timestamp with time zone' })
  expiredIn: Date;

  @OneToOne(() => UsersEntity, (user) => user.passConfirmation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;
}
