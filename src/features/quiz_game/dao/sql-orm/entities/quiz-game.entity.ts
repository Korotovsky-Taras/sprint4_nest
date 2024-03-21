import { Check, Column, CreateDateColumn, Entity, JoinColumn, JoinTable, ManyToMany, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { QuizGamePlayerProgressEntity } from './quiz-game-player-progress.entity';
import { QuizGameQuestionsEntity } from './quiz-game-questions.entity';

@Entity({ name: 'QuizGames' })
export class QuizGameEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column()
  fp_id: number;

  @OneToOne(() => QuizGamePlayerProgressEntity, { cascade: ['insert', 'update'] })
  @JoinColumn({ name: 'fp_id' })
  firstPlayerProgress: QuizGamePlayerProgressEntity;

  @Column({ nullable: true })
  sp_id: number | null;

  @OneToOne(() => QuizGamePlayerProgressEntity, { cascade: ['insert', 'update'] })
  @JoinColumn({ name: 'sp_id' })
  secondPlayerProgress: QuizGamePlayerProgressEntity | null;

  @ManyToMany(() => QuizGameQuestionsEntity, (questions) => questions.game, { cascade: ['insert'], nullable: true })
  @JoinTable()
  questions: QuizGameQuestionsEntity[] | null;

  @Column({ type: 'smallint', default: 0 })
  @Check(`"status" = ANY (ARRAY[0, 1, 2])`)
  status: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  startGameDate: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  finishGameDate: Date | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
