import { Module } from '@nestjs/common';
import { QuizGameController } from './api/quiz-game.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { SharedModule } from '../../shared.module';
import { withTypedDbModule, withTypedRepository } from '../../application/utils/withTyped';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizGameQueryRepoKey, QuizGameRepoKey } from './types/common';
import { QuizGameMongoQueryRepository } from './dao/mongo/quiz-game.mongo.query.repository';
import { QuizGameMongoRepository } from './dao/mongo/quiz-game.mongo.repository';
import { QuizGame, QuizGameSchema } from './dao/mongo/quiz-game.mongo.schema';
import { QuizGameSqlRawRepository } from './dao/sql-raw/quiz-game.sql-raw.repository';
import { QuizGameSqlRawQueryRepository } from './dao/sql-raw/quiz-game.sql-raw.query.repository';
import { QuizGameSqlOrmRepository } from './dao/sql-orm/quiz-game.sql-orm.repository';
import { QuizGameSqlOrmQueryRepository } from './dao/sql-orm/quiz-game.sql-orm.query.repository';
import { QuizGameQuestion, QuizGameQuestionSchema } from './dao/mongo/quiz-game-question.mongo.schema';
import { QuizGameAdminController } from './api/quiz-game.admin.controller';
import { quizCases } from './use-cases';
import { QuizGamePlayerProgress, QuizGamePlayerProgressSchema } from './dao/mongo/quiz-game-player-progress.mongo.schema';
import { UsersModule } from '../users/users.module';
import { QuizGameEntity } from './dao/sql-orm/entities/quiz-game.entity';
import { QuizGameQuestionsEntity } from './dao/sql-orm/entities/quiz-game-questions.entity';
import { QuizGamePlayerProgressEntity } from './dao/sql-orm/entities/quiz-game-player-progress.entity';
import { QuizGameProgressAnswersEntity } from './dao/sql-orm/entities/quiz-game-progress-answers.entity';
import { QuizGameQuestionsSubscriber } from './dao/sql-orm/entities/quiz-game-questions.subscriber';

const QuizGameQueryRepoTyped = withTypedRepository(QuizGameQueryRepoKey, {
  Mongo: QuizGameMongoQueryRepository,
  SQLRaw: QuizGameSqlRawQueryRepository,
  SQLOrm: QuizGameSqlOrmQueryRepository,
});
const QuizGameRepoTyped = withTypedRepository(QuizGameRepoKey, {
  Mongo: QuizGameMongoRepository,
  SQLRaw: QuizGameSqlRawRepository,
  SQLOrm: QuizGameSqlOrmRepository,
});
const QuizGameDbModuleTyped = withTypedDbModule({
  Mongo: MongooseModule.forFeature([
    {
      name: QuizGame.name,
      schema: QuizGameSchema,
    },
    {
      name: QuizGameQuestion.name,
      schema: QuizGameQuestionSchema,
    },
    {
      name: QuizGamePlayerProgress.name,
      schema: QuizGamePlayerProgressSchema,
    },
  ]),
  SQLOrm: TypeOrmModule.forFeature([QuizGameEntity, QuizGameProgressAnswersEntity, QuizGameQuestionsEntity, QuizGamePlayerProgressEntity]),
});

@Module({
  imports: [CqrsModule, QuizGameDbModuleTyped, SharedModule, UsersModule],
  controllers: [QuizGameController, QuizGameAdminController],
  providers: [QuizGameQueryRepoTyped, QuizGameRepoTyped, QuizGameQuestionsSubscriber, ...quizCases],
  exports: [QuizGameRepoTyped, QuizGameQueryRepoTyped],
})
export class QuizGameModule {}
