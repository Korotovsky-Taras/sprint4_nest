import { Module } from '@nestjs/common';
import { QuizGameController } from './api/quiz-game.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { SharedModule } from '../../shared.module';
import { withDbTypedClass, withDbTypedModule } from '../../application/utils/withTyped';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogsEntity } from '../blogs/dao/sql-orm/blogs.entity';
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

const QuizGameQueryRepoTyped = withDbTypedClass(QuizGameQueryRepoKey, {
  Mongo: QuizGameMongoQueryRepository,
  SQLRaw: QuizGameSqlRawQueryRepository,
  SQLOrm: QuizGameSqlOrmQueryRepository,
});
const QuizGameRepoTyped = withDbTypedClass(QuizGameRepoKey, {
  Mongo: QuizGameMongoRepository,
  SQLRaw: QuizGameSqlRawRepository,
  SQLOrm: QuizGameSqlOrmRepository,
});
const QuizGameDbModuleTyped = withDbTypedModule({
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
  SQLOrm: TypeOrmModule.forFeature([BlogsEntity]),
});

@Module({
  imports: [CqrsModule, QuizGameDbModuleTyped, SharedModule, UsersModule],
  controllers: [QuizGameController, QuizGameAdminController],
  providers: [QuizGameQueryRepoTyped, QuizGameRepoTyped, ...quizCases],
  exports: [QuizGameRepoTyped, QuizGameQueryRepoTyped],
})
export class QuizGameModule {}
