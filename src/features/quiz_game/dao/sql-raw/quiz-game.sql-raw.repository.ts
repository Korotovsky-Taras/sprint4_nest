import 'reflect-metadata';
import { Injectable } from '@nestjs/common';
import { IQuizGameRepository } from '../../types/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  GameViewAndPlayersIdCortege,
  QuizGameAnswerViewModel,
  QuizGameQuestionCreateModel,
  QuizGameQuestionPublishUpdateModel,
  QuizGameQuestionUpdateModel,
  QuizGameQuestionViewModel,
  QuizGameViewModel,
} from '../../types/dto';
import { QuizGameAnswerRawType, QuizGameQuestionRawType, QuizGameRawType, QuizGameStatus } from '../../types/dao';
import { QuizGameMongoDataMapper } from '../mongo/quiz-game.mongo.dm';
import { QuizGameSqlRawDataMapper } from './quiz-game.sql-raw.dm';

@Injectable()
export class QuizGameSqlRawRepository implements IQuizGameRepository<void> {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async connectSecondPlayerToGame(gameId: string, userData: { userId: string; userLogin: string }): Promise<QuizGameViewModel | null> {
    // создаем прогресс для пользователя
    await this.dataSource.query(`INSERT INTO public."QuizGamesPlayerProgress" ("gameId", "userId") values ($1, $2)`, [Number(gameId), Number(userData.userId)]);

    // добавляем второго игрока
    await this.dataSource.query(`UPDATE public."QuizGames" as g SET "sp_id" = $2, status=1, "startGameDate"=CURRENT_TIMESTAMP WHERE g."_id" = $1`, [
      Number(gameId),
      Number(userData.userId),
    ]);

    // добавляем вопросы
    await this.dataSource.query(
      `INSERT INTO public."QuizGamesLinkedQuestions" ("gameId", "questionId") SELECT $1 as "gameId", q._id as "questionId" FROM public."QuizGamesQuestions" as q ORDER BY random() LIMIT 5`,
      [Number(gameId)],
    );

    const game: QuizGameRawType | null = await this.getGameById(gameId);

    if (game != null) {
      return QuizGameSqlRawDataMapper.toGameView(game);
    }

    return null;
  }

  async createNewGame(userData: { userId: string; userLogin: string }): Promise<QuizGameViewModel | null> {
    const [res] = await this.dataSource.query<{ _id: number }[]>(`INSERT INTO public."QuizGames" as g ("fp_id", "status") VALUES ($1, 0) RETURNING g."_id"`, [
      Number(userData.userId),
    ]);

    const gameId = String(res._id);

    // создаем прогресс для пользователя
    await this.dataSource.query(`INSERT INTO public."QuizGamesPlayerProgress" ("gameId", "userId") values ($1, $2)`, [Number(gameId), Number(userData.userId)]);

    const game: QuizGameRawType | null = await this.getGameById(gameId);

    if (game != null) {
      return QuizGameSqlRawDataMapper.toGameView(game);
    }

    return null;
  }

  async getAwaitedGameId(): Promise<string | null> {
    const [game = null] = await this.dataSource.query<{ _id: number }[]>(`SELECT g."_id" FROM public."QuizGames" as g WHERE g.status = 0`);

    if (game !== null) {
      return String(game._id);
    }
    return null;
  }

  async getGameAndPlayers(gameId: string): Promise<GameViewAndPlayersIdCortege | null> {
    const game: QuizGameRawType | null = await this.getGameById(gameId);
    if (game !== null) {
      return [QuizGameSqlRawDataMapper.toGameView(game), [String(game.fp_id), String(game.sp_id)]];
    }
    return null;
  }

  async createQuestion(model: QuizGameQuestionCreateModel): Promise<QuizGameQuestionViewModel> {
    const res = await this.dataSource.query<QuizGameQuestionRawType>(
      `INSERT INTO public."QuizGamesQuestions" ("published", "body", "correctAnswers") VALUES ($1, $2, $3) RETURNING *`,
      [model.published, model.body, model.correctAnswers],
    );
    return QuizGameMongoDataMapper.toQuestionView(res[0]);
  }

  async updateQuestion(quizQuestionId: string, model: QuizGameQuestionUpdateModel): Promise<boolean> {
    const [, count] = await this.dataSource.query(
      `UPDATE public."QuizGamesQuestions" as q SET body=$2, "correctAnswers"=$3, "updatedAt"=CURRENT_TIMESTAMP WHERE q."_id" = $1`,
      [Number(quizQuestionId), model.body, model.correctAnswers],
    );

    return count > 0;
  }

  async updateQuestionPublishState(quizQuestionId: string, model: QuizGameQuestionPublishUpdateModel): Promise<boolean> {
    const [, count] = await this.dataSource.query(
      `UPDATE public."QuizGamesQuestions" as q SET published=$2, "updatedAt"=CURRENT_TIMESTAMP WHERE q."_id" = $1`,
      [Number(quizQuestionId), model.published],
    );

    return count > 0;
  }

  async deleteQuestionById(quizQuestionId: string): Promise<boolean> {
    const [, count] = await this.dataSource.query(`DELETE FROM public."QuizGamesQuestions" as q WHERE q."_id" = $1`, [Number(quizQuestionId)]);
    return count > 0;
  }

  async getPlayerGameWithStatus(userId: string, gameStatus: QuizGameStatus[]): Promise<QuizGameViewModel | null> {
    const [game = null] = await this.dataSource.query<QuizGameRawType[]>(
      `SELECT g.*,
              (SELECT row_to_json(row) as "firstPlayerProgress" FROM
                  (SELECT fp."score",
                          (json_build_object(
                                  'id', fp."userId",
                                  'login', u1."login"
                              )) as "player",
                          (SELECT array(SELECT row_to_json(row) FROM (
                                           SELECT pa.*
                                           FROM public."QuizGamesLinkedQuestions" lq
                                           LEFT JOIN public."QuizGamesProgressAnswers" pa ON pa."questionId" = lq."questionId" AND pa."progressId" = fp."_id"
                                           WHERE lq."gameId" = g."_id" AND pa."questionId" = lq."questionId"
                                       ) as row)) as "answers"
                  ) as row),
              (SELECT
                   CASE
                       WHEN g.sp_id IS NOT NULL THEN row_to_json(row)
                       END as "secondPlayerProgress"
               FROM (SELECT sp."score",
                            (json_build_object(
                                    'id', sp."userId",
                                    'login', u2."login"
                                )) as "player",
                            (SELECT array(SELECT row_to_json(row) FROM (
                                             SELECT pa.*
                                             FROM public."QuizGamesLinkedQuestions" lq
                                             LEFT JOIN public."QuizGamesProgressAnswers" pa ON pa."questionId" = lq."questionId" AND pa."progressId" = sp."_id"
                                             WHERE lq."gameId" = g."_id" AND pa."questionId" = lq."questionId"
                                         ) as row)) as "answers"
                    ) as row),
              (SELECT array(SELECT row_to_json(row) FROM (
                                             SELECT gq.* FROM public."QuizGamesLinkedQuestions" lq
                                             LEFT JOIN public."QuizGamesQuestions" gq ON gq."_id" = lq."questionId"
                                             WHERE  lq."gameId" = g."_id"
                                         ) as row)) as "questions"
       FROM public."QuizGames" as g
                LEFT JOIN public."QuizGamesPlayerProgress" fp ON g.fp_id = fp."userId" AND fp."gameId" = g."_id"
                LEFT JOIN public."QuizGamesPlayerProgress" sp ON g.sp_id = sp."userId" AND sp."gameId" = g."_id"
                LEFT JOIN public."Users" u1 ON fp."userId" = u1."_id"
                LEFT JOIN public."Users" u2 ON sp."userId" = u2."_id"
       WHERE g.status IN (${gameStatus.join(', ')}) AND (g."fp_id" = $1 OR g."sp_id" = $1)`,
      [Number(userId)],
    );

    if (game !== null) {
      return QuizGameSqlRawDataMapper.toGameView(game);
    }

    return null;
  }

  async isUserFinishInActiveGame(gameId: string, userId: string): Promise<boolean> {
    const [game = null] = await this.dataSource.query<{ id: number }[]>(
      `SELECT g."_id" as id FROM public."QuizGames" as g WHERE g."_id" = $1 AND g.status = 1 AND (g."fp_id" = $2 OR g."sp_id" = $2)`,
      [Number(gameId), Number(userId)],
    );

    if (game !== null) {
      const [progress = null] = await this.dataSource.query(
        `SELECT * FROM public."QuizGamesPlayerProgress" as p WHERE p."gameId" = $1 AND p.status = 1 AND p."userId" = $2`,
        [Number(game.id), Number(userId)],
      );

      return progress !== null;
    }

    return false;
  }

  async isUserInActiveGame(userId: string): Promise<boolean> {
    const statusIn = [QuizGameStatus.PendingSecondPlayer, QuizGameStatus.Active].join(', ');
    const [game = null] = await this.dataSource.query(
      `SELECT g.* FROM public."QuizGames" as g WHERE g.status IN (${statusIn}) AND (g."fp_id" = $1 OR g."sp_id" = $1)`,
      [Number(userId)],
    );
    return game !== null;
  }

  async setGameAnswer(gameId: string, userId: string, answer: string): Promise<QuizGameAnswerViewModel | null> {
    //получаем id второго игрока
    const [secondPlayer = null] = await this.dataSource.query<{ id: number }[]>(
      `SELECT CASE
                  WHEN g."fp_id" = $2 THEN g."sp_id"
                  WHEN g."sp_id" = $2 THEN g."fp_id"
                  END AS id
       FROM public."QuizGames" as g
       WHERE g."_id" = $1`,
      [Number(gameId), Number(userId)],
    );

    //если в игре нет второго игрока мы не имеем права отвечать
    if (secondPlayer === null) {
      return null;
    }

    //ищем текущий прогресс игрока
    const [currentPlayerProgress = null] = await this.dataSource.query<{ id: number }[]>(
      `SELECT p."_id" as id FROM public."QuizGamesPlayerProgress" as p WHERE p."userId" = $1 AND p."gameId" = $2`,
      [Number(userId), Number(gameId)],
    );

    if (currentPlayerProgress === null) {
      return null;
    }

    //ищем id вопросов на которые осталось ответить
    const currentPlayerLastQuestions = await this.dataSource.query<{ id: number }[]>(
      'SELECT p."questionId" as "id" FROM public."QuizGamesLinkedQuestions" as p WHERE p."gameId" = $1 AND NOT p."questionId" IN (SELECT qa."questionId" FROM public."QuizGamesProgressAnswers" qa WHERE qa."questionId" = p."questionId" AND qa."progressId" = $2)',
      [Number(gameId), currentPlayerProgress.id],
    );

    // берем первый вопрос
    const [nextQuestion = null] = currentPlayerLastQuestions;

    //если есть еще вопросы
    if (nextQuestion !== null) {
      //ищем вопрос
      const [ca = null] = await this.dataSource.query<{ correctAnswers: string[] }[]>(
        `SELECT p."correctAnswers" FROM public."QuizGamesQuestions" as p WHERE p."_id" = $1 `,
        [nextQuestion.id],
      );

      //ищем сравниваем ответ
      const isCorrect = ca && ca.correctAnswers.some((a) => a.toLowerCase() === answer.toLowerCase());

      //сохраняем ответ
      const answerRes = await this.dataSource.query<QuizGameAnswerRawType[]>(
        `INSERT INTO public."QuizGamesProgressAnswers" ("progressId", "questionId", status, answer) values ($1, $2, $3, $4) RETURNING *`,
        [currentPlayerProgress.id, nextQuestion.id, isCorrect ? 0 : 1, answer],
      );

      if (isCorrect) {
        //если ответ верный прибавляем score
        await this.dataSource.query(`UPDATE public."QuizGamesPlayerProgress" as p SET score= score + 1, "updatedAt"=CURRENT_TIMESTAMP WHERE p."_id" = $1`, [
          currentPlayerProgress.id,
        ]);
      }

      // если отвечаем на последний вопрос
      // необходимо посчитать бонусы
      if (currentPlayerLastQuestions.length === 1) {
        // Изменяем статус прогресса игрока на "завершил отвечать"
        await this.dataSource.query(`UPDATE public."QuizGamesPlayerProgress" as p SET status=1, "updatedAt"=CURRENT_TIMESTAMP WHERE p."_id" = $1`, [
          currentPlayerProgress.id,
        ]);

        //ищем текущий прогресс второго игрока
        const [secondPlayerProgress = null] = await this.dataSource.query<{ id: number }[]>(
          `SELECT p."_id" as id FROM public."QuizGamesPlayerProgress" as p WHERE p."userId" = $1 AND p."gameId" = $2`,
          [secondPlayer.id, Number(gameId)],
        );

        //ищем id вопросов на которые осталось ответить
        const secondPlayerLastQuestions = await this.dataSource.query<{ id: number }[]>(
          'SELECT p."questionId" as "id" FROM public."QuizGamesLinkedQuestions" as p WHERE p."gameId" = $1 AND NOT p."questionId" IN (SELECT qa."questionId" FROM public."QuizGamesProgressAnswers" qa WHERE qa."questionId" = p."questionId" AND qa."progressId" = $2)',
          [Number(gameId), secondPlayerProgress?.id],
        );

        if (secondPlayerLastQuestions.length === 0) {
          // пересчитать бонусы текущего игрока
          await this.dataSource.query(
            `UPDATE public."QuizGamesPlayerProgress" as p SET score= score + p."bonusScore", "bonusScore" = 0, "updatedAt"=CURRENT_TIMESTAMP WHERE p."_id" = $1`,
            [currentPlayerProgress.id],
          );
          // пересчитать бонусы второго игрока
          await this.dataSource.query(
            `UPDATE public."QuizGamesPlayerProgress" as p SET score= score + p."bonusScore", "bonusScore" = 0, "updatedAt"=CURRENT_TIMESTAMP WHERE p."_id" = $1`,
            [secondPlayerProgress?.id],
          );
          // закончить игру
          await this.dataSource.query(`UPDATE public."QuizGames" as g SET status = 2, "finishGameDate"=CURRENT_TIMESTAMP WHERE g."_id" = $1`, [Number(gameId)]);
        } else {
          // добавить бонусное очко текущему игроку
          await this.dataSource.query(
            `UPDATE public."QuizGamesPlayerProgress" as p SET "bonusScore" = "bonusScore" + 1, "updatedAt"=CURRENT_TIMESTAMP WHERE p."_id" = $1`,
            [currentPlayerProgress.id],
          );
        }
      }

      return QuizGameSqlRawDataMapper.toAnswerView(answerRes[0]);
    }

    return null;
  }

  async getGameById(gameId: string): Promise<QuizGameRawType | null> {
    const [game = null] = await this.dataSource.query<QuizGameRawType[]>(
      `SELECT g.*,
              (SELECT row_to_json(row) as "firstPlayerProgress" FROM
                  (SELECT fp."score",
                          (json_build_object(
                                  'id', fp."userId",
                                  'login', u1."login"
                              )) as "player",
                          (SELECT array(SELECT row_to_json(row) FROM (
                                           SELECT pa."status", pa."questionId", pa."createdAt"
                                           FROM public."QuizGamesLinkedQuestions" lq
                                                    LEFT JOIN public."QuizGamesProgressAnswers" pa ON pa."questionId" = lq."questionId" AND pa."progressId" = fp."_id"
                                           WHERE lq."gameId" = g."_id" AND pa."questionId" = lq."questionId"
                                       ) as row)) as "answers"
                  ) as row),
              (SELECT
                   CASE
                       WHEN g.sp_id IS NOT NULL THEN row_to_json(row)
                       END as "secondPlayerProgress"
               FROM (SELECT sp."score",
                            (json_build_object(
                                    'id', sp."userId",
                                    'login', u2."login"
                                )) as "player",
                            (SELECT array(SELECT row_to_json(row) FROM (
                                             SELECT pa."status", pa."questionId", pa."createdAt"
                                             FROM public."QuizGamesLinkedQuestions" lq
                                                      LEFT JOIN public."QuizGamesProgressAnswers" pa ON pa."questionId" = lq."questionId" AND pa."progressId" = sp."_id"
                                             WHERE lq."gameId" = g."_id" AND pa."questionId" = lq."questionId"
                                         ) as row)) as "answers"
                    ) as row),
           (SELECT array(SELECT row_to_json(row) FROM (
                                          SELECT gq.* FROM public."QuizGamesLinkedQuestions" lq
                                          LEFT JOIN public."QuizGamesQuestions" gq ON gq."_id" = lq."questionId"
                                          WHERE  lq."gameId" = g."_id"
                                      ) as row)) as "questions"
       FROM public."QuizGames" as g
                LEFT JOIN public."QuizGamesPlayerProgress" fp ON g.fp_id = fp."userId" AND fp."gameId" = g."_id"
                LEFT JOIN public."QuizGamesPlayerProgress" sp ON g.sp_id = sp."userId" AND sp."gameId" = g."_id"
                LEFT JOIN public."Users" u1 ON fp."userId" = u1."_id"
                LEFT JOIN public."Users" u2 ON sp."userId" = u2."_id"
       WHERE g."_id" = $1`,
      [Number(gameId)],
    );

    return game;
  }

  async saveDoc(): Promise<void> {}

  async clear(): Promise<void> {
    await this.dataSource.query(`TRUNCATE TABLE public."QuizGames" CASCADE`);
    await this.dataSource.query(`TRUNCATE TABLE public."QuizGamesQuestions" CASCADE`);
  }
}
