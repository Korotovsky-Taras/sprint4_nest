import { Check, Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { QuizGamePlayerProgressEntity } from './quiz-game-player-progress.entity';
import { QuizGameQuestionsEntity } from './quiz-game-questions.entity';

@Entity({ name: 'QuizGamesProgressAnswers' })
export class QuizGameProgressAnswersEntity {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column()
  progressId: number;

  @ManyToOne(() => QuizGamePlayerProgressEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'progressId' })
  pe: QuizGamePlayerProgressEntity;

  @Column()
  questionId: number;

  @OneToMany(() => QuizGameQuestionsEntity, (question) => question.answers)
  @JoinColumn({ name: 'questionId' })
  qe: QuizGameQuestionsEntity;

  @Column({ type: 'smallint' })
  @Check(`"status" = ANY (ARRAY[0, 1])`)
  status: number;

  @Column()
  answer: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  static create(progressId: number, questionId: number, status: number, answer: string): QuizGameProgressAnswersEntity {
    const entity = new this();
    entity.progressId = progressId;
    entity.questionId = questionId;
    entity.status = status;
    entity.answer = answer;
    return entity;
  }
}
