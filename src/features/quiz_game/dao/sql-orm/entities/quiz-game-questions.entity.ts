import { BeforeInsert, Column, CreateDateColumn, Entity, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { QuizGameQuestionCreateModel } from '../../../types/dto';
import { QuizGameQuestionOrmType } from '../../../types/dao';
import { WithDbId } from '../../../../../application/utils/types';
import { QuizGameEntity } from './quiz-game.entity';
import { QuizGameProgressAnswersEntity } from './quiz-game-progress-answers.entity';

@Entity({ name: 'QuizGamesQuestions' })
export class QuizGameQuestionsEntity implements WithDbId<QuizGameQuestionOrmType> {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column()
  published: boolean;

  @Column()
  body: string;

  @Column('text', { array: true })
  correctAnswers: string[];

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone', nullable: true })
  updatedAt: Date | null;

  @ManyToMany(() => QuizGameEntity, (game) => game.questions)
  game: QuizGameEntity;

  @OneToMany(() => QuizGameProgressAnswersEntity, (answers) => answers.qe)
  answers: QuizGameProgressAnswersEntity[];

  @BeforeInsert()
  initialValues() {
    this.updatedAt = null;
  }

  static create(model: QuizGameQuestionCreateModel): QuizGameQuestionsEntity {
    const entity = new this();
    entity.body = model.body;
    entity.correctAnswers = model.correctAnswers;
    entity.published = model.published;
    return entity;
  }
}
