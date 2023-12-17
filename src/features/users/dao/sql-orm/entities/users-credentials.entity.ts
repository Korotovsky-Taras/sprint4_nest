import { Column, Entity, JoinColumn, OneToOne, PrimaryColumn } from 'typeorm';
import { UsersEntity } from './users.entity';

@Entity({ name: 'UsersCredentials' })
export class UsersCredentialsEntity {
  @PrimaryColumn()
  userId: number;

  @Column()
  hash: string;

  @Column()
  salt: string;

  @OneToOne(() => UsersEntity, (user) => user.password, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;
}
