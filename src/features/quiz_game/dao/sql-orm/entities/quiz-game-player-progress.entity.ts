import { Check, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { UsersEntity } from '../../../../users/dao/sql-orm/entities/users.entity';
import { QuizGameEntity } from './quiz-game.entity';
import { QuizGameProgressAnswersEntity } from './quiz-game-progress-answers.entity';

@Entity({ name: 'QuizGamesPlayerProgress' })
export class QuizGamePlayerProgressEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  @OneToOne(() => QuizGameEntity, { onDelete: 'CASCADE' })
  game: QuizGameEntity;

  @OneToMany(() => QuizGameProgressAnswersEntity, (answer) => answer.pe, { cascade: ['insert', 'update'] })
  answers: QuizGameProgressAnswersEntity[];

  @Column()
  userId: number;

  @ManyToOne(() => UsersEntity)
  @JoinColumn({ name: 'userId' })
  user: UsersEntity;

  @Column({ type: 'smallint', default: 0 })
  score: number;

  @Column({ type: 'smallint', default: 0 })
  bonusScore: number;

  @Column({ type: 'smallint', default: 0 })
  @Check(`"status" = ANY (ARRAY[0, 1])`)
  status: number;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true, default: null })
  updatedAt: Date | null;

  static create(userId: number): QuizGamePlayerProgressEntity {
    const entity = new this();
    entity.userId = userId;
    return entity;
  }
}
