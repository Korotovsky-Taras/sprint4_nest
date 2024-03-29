import { testInit } from './utils/test.init';
import { authBasic64, TestCreateUtils } from './utils/test.create.utils';
import { Status } from '../src/application/utils/types';

describe('quiz game testing', () => {
  const config = testInit();
  const utils = new TestCreateUtils(config);

  beforeAll(async () => {
    await config.getDaoUtils().clearAll();
  });

  it('should create 20 questions', async () => {
    const questionsCount = 20;

    for (let i = 0; i < questionsCount; i++) {
      const res = await config
        .getHttp()
        .post('/sa/quiz/questions')
        .set('Authorization', 'Basic ' + authBasic64)
        .set('Content-Type', 'application/json')
        .send({
          ...utils.createNewQuestionModel(),
        })
        .expect(Status.CREATED);

      // Публикуем вопрос
      await config
        .getHttp()
        .put(`/sa/quiz/questions/${res.body.id}/publish`)
        .set('Authorization', 'Basic ' + authBasic64)
        .send({
          published: true,
        });
    }

    const res = await config
      .getHttp()
      .get(`/sa/quiz/questions?pageSize=${questionsCount}`)
      .set('Authorization', 'Basic ' + authBasic64)
      .set('Content-Type', 'application/json')
      .expect(Status.OK);

    expect(res.body.items).toHaveLength(questionsCount);
  });

  it('player should answer right order', async () => {
    const usrModel1 = utils.createNewUserModel();
    const usrModel2 = utils.createNewUserModel();

    await utils.createUser(usrModel1);
    await utils.createUser(usrModel2);
    //авторизуем юзера 1
    const res1 = await config
      .getHttp()
      .post(`/auth/login`)
      .set('Content-Type', 'application/json')
      .send({
        loginOrEmail: usrModel1.login,
        password: usrModel1.password,
      })
      .expect(Status.OK);

    expect(res1.body).toEqual({
      accessToken: expect.any(String),
    });

    const u1at = res1.body.accessToken;

    //авторизуем юзера 2
    const res2 = await config
      .getHttp()
      .post(`/auth/login`)
      .set('Content-Type', 'application/json')
      .send({
        loginOrEmail: usrModel2.login,
        password: usrModel2.password,
      })
      .expect(Status.OK);

    expect(res2.body).toEqual({
      accessToken: expect.any(String),
    });

    const u2at = res2.body.accessToken;

    await config
      .getHttp()
      .post(`/pair-game-quiz/pairs/connection`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + u1at)
      .expect(Status.OK);

    await config
      .getHttp()
      .post(`/pair-game-quiz/pairs/connection`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + u2at)
      .expect(Status.OK);

    const gameRes = await config
      .getHttp()
      .get(`/pair-game-quiz/pairs/my-current`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + u2at)
      .expect(Status.OK);

    expect(gameRes.body.questions).not.toBeUndefined();
    expect(gameRes.body.questions).toHaveLength(5);

    const [question1_id, question2_id, question3_id, question4_id, question5_id] = gameRes.body.questions.map((q) => q.id);

    const res_a1 = await utils.sendQuizAnswer(u1at, true);

    expect(res_a1.answer.questionId).toBe(question1_id);
    expect(res_a1.answer.answerStatus).toBe('Correct');
    expect(res_a1.current.firstPlayerProgress?.answers).toHaveLength(1);
    expect(res_a1.current.firstPlayerProgress?.answers[0].questionId).toBe(question1_id);

    const res_a2 = await utils.sendQuizAnswer(u1at, false);

    expect(res_a2.answer.questionId).toBe(question2_id);
    expect(res_a2.answer.answerStatus).toBe('Incorrect');
    expect(res_a2.current.firstPlayerProgress?.answers).toHaveLength(2);
    expect(res_a2.current.firstPlayerProgress?.answers[1].questionId).toBe(question2_id);

    const res_a3 = await utils.sendQuizAnswer(u1at, false);

    expect(res_a3.answer.questionId).toBe(question3_id);
    expect(res_a3.answer.answerStatus).toBe('Incorrect');
    expect(res_a3.current.firstPlayerProgress?.answers).toHaveLength(3);
    expect(res_a3.current.firstPlayerProgress?.answers[2].questionId).toBe(question3_id);

    const res_a4 = await utils.sendQuizAnswer(u1at, false);
    expect(res_a4.answer.questionId).toBe(question4_id);
    expect(res_a4.answer.answerStatus).toBe('Incorrect');
    expect(res_a4.current.firstPlayerProgress?.answers).toHaveLength(4);
    expect(res_a4.current.firstPlayerProgress?.answers[3].questionId).toBe(question4_id);

    const res_a5 = await utils.sendQuizAnswer(u1at, true);
    expect(res_a5.answer.questionId).toBe(question5_id);
    expect(res_a5.answer.answerStatus).toBe('Correct');
    expect(res_a5.current.firstPlayerProgress?.answers).toHaveLength(5);
    expect(res_a5.current.firstPlayerProgress?.answers[4].questionId).toBe(question5_id);
  });

  it('POST/DELETE/PUT -> questions -> should create/delete/update', async () => {
    const questionModel = utils.createNewQuestionModel();
    const res1 = await config
      .getHttp()
      .post('/sa/quiz/questions')
      .set('Authorization', 'Basic ' + authBasic64)
      .set('Content-Type', 'application/json')
      .send({
        ...questionModel,
      })
      .expect(Status.CREATED);

    expect(res1.body).toEqual({
      id: expect.any(String),
      body: questionModel.body,
      correctAnswers: expect.any(Array),
      published: false,
      createdAt: expect.any(String),
      updatedAt: null,
    });

    res1.body.correctAnswers.forEach((answer) => {
      expect(typeof answer).toBe('string'); // Проверяем, что каждый элемент массива является строкой
    });

    const questionUpdateModel = utils.createNewQuestionModel();
    await config
      .getHttp()
      .put(`/sa/quiz/questions/${res1.body.id}`)
      .set('Authorization', 'Basic ' + authBasic64)
      .send({
        body: questionUpdateModel.body,
        correctAnswers: questionUpdateModel.correctAnswers,
      })
      .expect(Status.NO_CONTENT);

    const res2 = await config
      .getHttp()
      .get(`/sa/quiz/questions/${res1.body.id}`)
      .set('Authorization', 'Basic ' + authBasic64)
      .expect(Status.OK);

    // Проверяем, что данные записались
    expect(res2.body).toEqual({
      id: expect.any(String),
      body: questionUpdateModel.body,
      correctAnswers: expect.arrayContaining(questionUpdateModel.correctAnswers),
      published: false,
      createdAt: expect.any(String),
      updatedAt: expect.any(String),
    });

    res2.body.correctAnswers.forEach((answer) => {
      expect(typeof answer).toBe('string'); // Проверяем, что каждый элемент массива является строкой
    });

    // Публикуем вопрос
    await config
      .getHttp()
      .put(`/sa/quiz/questions/${res1.body.id}/publish`)
      .set('Authorization', 'Basic ' + authBasic64)
      .send({
        published: true,
      })
      .expect(Status.NO_CONTENT);

    const res3 = await config
      .getHttp()
      .get(`/sa/quiz/questions/${res1.body.id}`)
      .set('Authorization', 'Basic ' + authBasic64)
      .expect(Status.OK);

    // Проверяем, что он опубликован
    expect(res3.body.published).toBeTruthy();

    // Отменяем публикацию
    await config
      .getHttp()
      .put(`/sa/quiz/questions/${res1.body.id}/publish`)
      .set('Authorization', 'Basic ' + authBasic64)
      .send({
        published: false,
      })
      .expect(Status.NO_CONTENT);

    const res4 = await config
      .getHttp()
      .get(`/sa/quiz/questions/${res1.body.id}`)
      .set('Authorization', 'Basic ' + authBasic64)
      .expect(Status.OK);

    // Проверяем, что публикация отменена
    expect(res4.body.published).toBeFalsy();

    // Проверяем, что вопрос удаляется
    await config
      .getHttp()
      .delete(`/sa/quiz/questions/${res1.body.id}`)
      .set('Authorization', 'Basic ' + authBasic64)
      .expect(Status.NO_CONTENT);

    // Проверяем, что вопрос удален
    await config
      .getHttp()
      .get(`/sa/quiz/questions/${res1.body.id}`)
      .set('Authorization', 'Basic ' + authBasic64)
      .expect(Status.NOT_FOUND);
  });

  it('POST/DELETE/PUT -> questions -> should NOT create/delete/update without auth', async () => {
    await config
      .getHttp()
      .post('/sa/quiz/questions')
      .set('Content-Type', 'application/json')
      .send({
        ...utils.createNewQuestionModel(),
      })
      .expect(Status.UNATHORIZED);

    const res1 = await config
      .getHttp()
      .post('/sa/quiz/questions')
      .set('Authorization', 'Basic ' + authBasic64)
      .set('Content-Type', 'application/json')
      .send({
        ...utils.createNewQuestionModel(),
      })
      .expect(Status.CREATED);

    await config
      .getHttp()
      .put(`/sa/quiz/questions/${res1.body.id}`)
      .set('Content-Type', 'application/json')
      .send({
        ...utils.createNewQuestionModel(),
      })
      .expect(Status.UNATHORIZED);

    await config
      .getHttp()
      .put(`/sa/quiz/questions/${res1.body.id}/publish`)
      .set('Content-Type', 'application/json')
      .send({
        publish: true,
      })
      .expect(Status.UNATHORIZED);

    await config.getHttp().delete(`/sa/quiz/questions/${res1.body.id}`).expect(Status.UNATHORIZED);
  });

  it('POST -> questions -> should return error when invalid data', async () => {
    const res1 = await config
      .getHttp()
      .post('/sa/quiz/questions')
      .set('Authorization', 'Basic ' + authBasic64)
      .set('Content-Type', 'application/json')
      .send({})
      .expect(Status.BAD_REQUEST);

    expect(res1.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'body',
        },
        {
          message: expect.any(String),
          field: 'correctAnswers',
        },
      ],
    });

    const res2 = await config
      .getHttp()
      .post('/sa/quiz/questions')
      .set('Authorization', 'Basic ' + authBasic64)
      .set('Content-Type', 'application/json')
      .send({
        body: 'short',
        correctAnswers: [1, '3', 4],
      })
      .expect(Status.BAD_REQUEST);

    expect(res2.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'body',
        },
      ],
    });

    const res3 = await config
      .getHttp()
      .post('/sa/quiz/questions')
      .set('Authorization', 'Basic ' + authBasic64)
      .set('Content-Type', 'application/json')
      .send({
        body: 'long valid body string',
        correctAnswers: [],
      })
      .expect(Status.BAD_REQUEST);

    expect(res3.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'correctAnswers',
        },
      ],
    });
  });

  it('should create game u1 & connect game u2', async () => {
    const usrModel1 = utils.createNewUserModel();
    const usrModel2 = utils.createNewUserModel();

    await utils.createUser(usrModel1);
    await utils.createUser(usrModel2);

    //авторизуем юзера 1
    const res1 = await config
      .getHttp()
      .post(`/auth/login`)
      .set('Content-Type', 'application/json')
      .send({
        loginOrEmail: usrModel1.login,
        password: usrModel1.password,
      })
      .expect(Status.OK);

    expect(res1.body).toEqual({
      accessToken: expect.any(String),
    });

    const user1at = res1.body.accessToken;

    //авторизуем юзера 2
    const res2 = await config
      .getHttp()
      .post(`/auth/login`)
      .set('Content-Type', 'application/json')
      .send({
        loginOrEmail: usrModel2.login,
        password: usrModel2.password,
      })
      .expect(Status.OK);

    expect(res2.body).toEqual({
      accessToken: expect.any(String),
    });

    const user2at = res2.body.accessToken;

    // создаем игру
    const cgRes1 = await config
      .getHttp()
      .post(`/pair-game-quiz/pairs/connection`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + user1at)
      .expect(Status.OK);

    // проверяем что если в игре один игрок, там
    // - нет вопросов
    // - нет дат начала игры/конца игры
    // - правильный статус игры
    expect(cgRes1.body).toEqual({
      id: expect.any(String),
      firstPlayerProgress: expect.any(Object),
      secondPlayerProgress: null,
      questions: null,
      status: 'PendingSecondPlayer',
      pairCreatedDate: expect.any(String),
      startGameDate: null,
      finishGameDate: null,
    });

    // пробуем законектиться еще раз тем же пользователем
    await config
      .getHttp()
      .post(`/pair-game-quiz/pairs/connection`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + user1at)
      .expect(Status.FORBIDDEN);

    // коннектимся вторым игроком
    const cgRes2 = await config
      .getHttp()
      .post(`/pair-game-quiz/pairs/connection`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + user2at)
      .expect(Status.OK);

    // проверяем что если в игре два игрока, там
    // - есть вопросы
    // - есть даты начала игры
    // - нет дат конца игры
    // - правильный статус игры
    expect(cgRes2.body).toEqual({
      id: expect.any(String),
      firstPlayerProgress: expect.any(Object),
      secondPlayerProgress: expect.any(Object),
      questions: expect.arrayContaining([expect.any(Object), expect.any(Object), expect.any(Object), expect.any(Object), expect.any(Object)]),
      status: 'Active',
      pairCreatedDate: expect.any(String),
      startGameDate: expect.any(String),
      finishGameDate: null,
    });
  });

  it('should play game u1 & u2 -> u1 should win first with bonus', async () => {
    const usrModel1 = utils.createNewUserModel();
    const usrModel2 = utils.createNewUserModel();

    await utils.createUser(usrModel1);
    await utils.createUser(usrModel2);

    //авторизуем юзера 1
    const res1 = await config
      .getHttp()
      .post(`/auth/login`)
      .set('Content-Type', 'application/json')
      .send({
        loginOrEmail: usrModel1.login,
        password: usrModel1.password,
      })
      .expect(Status.OK);

    expect(res1.body).toEqual({
      accessToken: expect.any(String),
    });

    const u1at = res1.body.accessToken;

    //авторизуем юзера 2
    const res2 = await config
      .getHttp()
      .post(`/auth/login`)
      .set('Content-Type', 'application/json')
      .send({
        loginOrEmail: usrModel2.login,
        password: usrModel2.password,
      })
      .expect(Status.OK);

    expect(res2.body).toEqual({
      accessToken: expect.any(String),
    });

    const u2at = res2.body.accessToken;

    await config
      .getHttp()
      .post(`/pair-game-quiz/pairs/connection`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + u1at)
      .expect(Status.OK);

    await config
      .getHttp()
      .post(`/pair-game-quiz/pairs/connection`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + u2at)
      .expect(Status.OK);

    // первый пользователь должен закончить игру первым
    // дав два правильных ответа

    await utils.sendQuizAnswer(u1at, true);

    const u1Current = await config
      .getHttp()
      .get(`/pair-game-quiz/pairs/my-current`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + u1at)
      .expect(Status.OK);

    for (let i = 0; i < 3; i++) {
      await utils.sendQuizAnswer(u1at, false);
    }
    await utils.sendQuizAnswer(u1at, true);

    //шестой ответ запрещен
    await config
      .getHttp()
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + u1at)
      .send({ answer: 'correct' })
      .expect(Status.FORBIDDEN);

    // второй пользователь должен закончить игру вторым
    // дав два правильных ответа
    await utils.sendQuizAnswer(u2at, true);
    for (let i = 0; i < 3; i++) {
      await utils.sendQuizAnswer(u2at, false);
    }
    await utils.sendQuizAnswer(u2at, true);

    //шестой ответ запрещен
    await config
      .getHttp()
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + u2at)
      .send({ answer: 'correct' })
      .expect(Status.FORBIDDEN);

    const u1GameRes = await config
      .getHttp()
      .get(`/pair-game-quiz/pairs/${u1Current.body.id}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + u2at)
      .expect(Status.OK);

    const correctU1Answers = u1GameRes.body.firstPlayerProgress.answers.filter((answer) => answer.answerStatus === 'Correct');
    const incorrectU1Answers = u1GameRes.body.firstPlayerProgress.answers.filter((answer) => answer.answerStatus === 'Incorrect');

    expect(u1GameRes.body.firstPlayerProgress.answers.length).toBe(5);

    // пользователь закончил первым значит у него есть бонусное очко
    expect(u1GameRes.body.firstPlayerProgress.score).toBe(3);
    expect(correctU1Answers.length).toBe(2);
    expect(incorrectU1Answers.length).toBe(3);

    const u2GameRes = await config
      .getHttp()
      .get(`/pair-game-quiz/pairs/${u1GameRes.body.id}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + u2at)
      .expect(Status.OK);

    const correctU2Answers = u2GameRes.body.firstPlayerProgress.answers.filter((answer) => answer.answerStatus === 'Correct');
    const incorrectU2Answers = u2GameRes.body.firstPlayerProgress.answers.filter((answer) => answer.answerStatus === 'Incorrect');

    expect(u2GameRes.body.secondPlayerProgress.answers.length).toBe(5);

    // пользователь закончил вторым значит у него нет бонусного очка
    expect(u2GameRes.body.secondPlayerProgress.score).toBe(2);
    expect(correctU2Answers.length).toBe(2);
    expect(incorrectU2Answers.length).toBe(3);

    // Игра должна быть закончена
    expect(u2GameRes.body.status).toBe('Finished');

    // текущей игры быть не должно, она должна быть закончена
    await config
      .getHttp()
      .get(`/pair-game-quiz/pairs/my-current`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + u1at)
      .expect(Status.NOT_FOUND);

    // текущей игры быть не должно, она должна быть закончена
    await config
      .getHttp()
      .get(`/pair-game-quiz/pairs/my-current`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + u2at)
      .expect(Status.NOT_FOUND);
  });

  it('should add bonus score to win player only if game ends', async () => {
    const usrModel1 = utils.createNewUserModel();
    const usrModel2 = utils.createNewUserModel();

    await utils.createUser(usrModel1);
    await utils.createUser(usrModel2);

    //авторизуем юзера 1
    const res1 = await config
      .getHttp()
      .post(`/auth/login`)
      .set('Content-Type', 'application/json')
      .send({
        loginOrEmail: usrModel1.login,
        password: usrModel1.password,
      })
      .expect(Status.OK);

    expect(res1.body).toEqual({
      accessToken: expect.any(String),
    });

    const u1at = res1.body.accessToken;

    //авторизуем юзера 2
    const res2 = await config
      .getHttp()
      .post(`/auth/login`)
      .set('Content-Type', 'application/json')
      .send({
        loginOrEmail: usrModel2.login,
        password: usrModel2.password,
      })
      .expect(Status.OK);

    expect(res2.body).toEqual({
      accessToken: expect.any(String),
    });

    const u2at = res2.body.accessToken;

    await config
      .getHttp()
      .post(`/pair-game-quiz/pairs/connection`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + u1at)
      .expect(Status.OK);

    await config
      .getHttp()
      .post(`/pair-game-quiz/pairs/connection`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + u2at)
      .expect(Status.OK);

    const res_a1 = await utils.sendQuizAnswer(u1at, true);
    expect(res_a1.current.firstPlayerProgress?.score).toBe(1);

    const res_a2 = await utils.sendQuizAnswer(u1at, true);
    expect(res_a2.current.firstPlayerProgress?.score).toBe(2);

    const res_a3 = await utils.sendQuizAnswer(u2at, true);
    expect(res_a3.current.secondPlayerProgress?.score).toBe(1);

    const res_a4 = await utils.sendQuizAnswer(u2at, true);
    expect(res_a4.current.secondPlayerProgress?.score).toBe(2);

    const res_a5 = await utils.sendQuizAnswer(u1at, false);
    expect(res_a5.current.firstPlayerProgress?.score).toBe(2);

    const res_a6 = await utils.sendQuizAnswer(u1at, true);
    expect(res_a6.current.firstPlayerProgress?.score).toBe(3);

    const res_a7 = await utils.sendQuizAnswer(u1at, false);
    expect(res_a7.current.firstPlayerProgress?.score).toBe(3);

    const res_a8 = await utils.sendQuizAnswer(u2at, true);
    expect(res_a8.current.secondPlayerProgress?.score).toBe(3);

    const res_a9 = await utils.sendQuizAnswer(u2at, false);
    expect(res_a9.current.secondPlayerProgress?.score).toBe(3);

    await utils.sendQuizAnswer(u2at, false);

    //Конец игры, все ответили, бонусное очко должно появиться у первого игрока
    const finalUser1res = await config
      .getHttp()
      .get(`/pair-game-quiz/pairs/${res_a1.current.id}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + u1at)
      .expect(Status.OK);

    expect(finalUser1res.body.firstPlayerProgress?.score).toBe(4);
  });

  it('should return 403 if not connected user try get game by id', async () => {
    const usrModel1 = utils.createNewUserModel();
    const usrModel2 = utils.createNewUserModel();

    await utils.createUser(usrModel1);
    await utils.createUser(usrModel2);

    //авторизуем юзера 1
    const res1 = await config
      .getHttp()
      .post(`/auth/login`)
      .set('Content-Type', 'application/json')
      .send({
        loginOrEmail: usrModel1.login,
        password: usrModel1.password,
      })
      .expect(Status.OK);

    expect(res1.body).toEqual({
      accessToken: expect.any(String),
    });

    const u1at = res1.body.accessToken;

    //авторизуем юзера 2
    const res2 = await config
      .getHttp()
      .post(`/auth/login`)
      .set('Content-Type', 'application/json')
      .send({
        loginOrEmail: usrModel2.login,
        password: usrModel2.password,
      })
      .expect(Status.OK);

    expect(res2.body).toEqual({
      accessToken: expect.any(String),
    });

    const u2at = res2.body.accessToken;

    const res3 = await config
      .getHttp()
      .post(`/pair-game-quiz/pairs/connection`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + u1at)
      .expect(Status.OK);

    expect(res3.body.id).not.toBeUndefined();

    await config
      .getHttp()
      .get(`/pair-game-quiz/pairs/${res3.body.id}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + u2at)
      .expect(Status.FORBIDDEN);
  });

  it('should return 403 if not connected user try answer in game', async () => {
    await utils.wait(10);

    const usrModel1 = utils.createNewUserModel();
    const usrModel2 = utils.createNewUserModel();

    await utils.createUser(usrModel1);
    await utils.createUser(usrModel2);

    //авторизуем юзера 1
    const res1 = await config
      .getHttp()
      .post(`/auth/login`)
      .set('Content-Type', 'application/json')
      .send({
        loginOrEmail: usrModel1.login,
        password: usrModel1.password,
      })
      .expect(Status.OK);

    expect(res1.body).toEqual({
      accessToken: expect.any(String),
    });

    const user1at = res1.body.accessToken;

    //авторизуем юзера 2
    const res2 = await config
      .getHttp()
      .post(`/auth/login`)
      .set('Content-Type', 'application/json')
      .send({
        loginOrEmail: usrModel2.login,
        password: usrModel2.password,
      })
      .expect(Status.OK);

    expect(res2.body).toEqual({
      accessToken: expect.any(String),
    });

    const user2at = res2.body.accessToken;

    // создаем игру
    await config
      .getHttp()
      .post(`/pair-game-quiz/pairs/connection`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + user1at)
      .expect(Status.OK);

    // пробуем ответить пользователем 2
    await config
      .getHttp()
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + user2at)
      .send({ answer: 'incorrect' })
      .expect(Status.FORBIDDEN);
  });

  it('should return 403 if connected user try answer in game without second player ', async () => {
    await utils.wait(10);

    const usrModel1 = utils.createNewUserModel();

    await utils.createUser(usrModel1);

    //авторизуем юзера 1
    const res1 = await config
      .getHttp()
      .post(`/auth/login`)
      .set('Content-Type', 'application/json')
      .send({
        loginOrEmail: usrModel1.login,
        password: usrModel1.password,
      })
      .expect(Status.OK);

    expect(res1.body).toEqual({
      accessToken: expect.any(String),
    });

    const user1at = res1.body.accessToken;

    // создаем игру
    await config
      .getHttp()
      .post(`/pair-game-quiz/pairs/connection`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + user1at)
      .expect(Status.OK);

    // пробуем ответить пользователем 2
    await config
      .getHttp()
      .post(`/pair-game-quiz/pairs/my-current/answers`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Bearer ' + user1at)
      .send({ answer: 'incorrect' })
      .expect(Status.FORBIDDEN);
  });
});
