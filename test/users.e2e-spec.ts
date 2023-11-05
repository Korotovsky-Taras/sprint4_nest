import { testInit } from './utils/test.init';
import { authBasic64, TestCreateUtils } from './utils/test.create.utils';
import { Status } from '../src/application/utils/types';

describe('auth testing', () => {
  const config = testInit();
  const utils = new TestCreateUtils(config);

  beforeAll(async () => {
    await config.getDaoUtils().clearAll();
  });

  it('POST -> should create user', async () => {
    await config
      .getHttp()
      .post('/sa/users')
      .set('Authorization', 'Basic ' + authBasic64)
      .set('Content-Type', 'application/json')
      .send({
        ...utils.createNewUserModel(),
      })
      .expect(Status.CREATED);
  });

  it('POST -> should return error body is incorrect', async () => {
    const userModel = utils.createNewUserModel();
    const res1 = await config
      .getHttp()
      .post('/sa/users')
      .set('Authorization', 'Basic ' + authBasic64)
      .set('Content-Type', 'application/json')
      .send({
        login: '',
        email: userModel.email,
        password: userModel.password,
      })
      .expect(Status.BAD_REQUEST);

    expect(res1.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'login',
        },
      ],
    });

    const res2 = await config
      .getHttp()
      .post('/sa/users')
      .set('Authorization', 'Basic ' + authBasic64)
      .set('Content-Type', 'application/json')
      .send({
        login: userModel.login,
        email: 'not valid email',
        password: userModel.password,
      })
      .expect(Status.BAD_REQUEST);

    expect(res2.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'email',
        },
      ],
    });

    const res3 = await config
      .getHttp()
      .post('/sa/users')
      .set('Authorization', 'Basic ' + authBasic64)
      .set('Content-Type', 'application/json')
      .send({
        login: userModel.login,
        email: userModel.email,
        password: '1',
      })
      .expect(Status.BAD_REQUEST);

    expect(res3.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'password',
        },
      ],
    });

    const res4 = await config
      .getHttp()
      .post('/sa/users')
      .set('Authorization', 'Basic ' + authBasic64)
      .set('Content-Type', 'application/json')
      .send({
        login: '1',
        email: '1',
        password: '1',
      })
      .expect(Status.BAD_REQUEST);

    expect(res4.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'login',
        },
        {
          message: expect.any(String),
          field: 'email',
        },
        {
          message: expect.any(String),
          field: 'password',
        },
      ],
    });

    const res5 = await config
      .getHttp()
      .post('/sa/users')
      .set('Authorization', 'Basic ' + authBasic64)
      .set('Content-Type', 'application/json')
      .expect(Status.BAD_REQUEST);

    expect(res5.body).toEqual({
      errorsMessages: [
        {
          message: expect.any(String),
          field: 'login',
        },
        {
          message: expect.any(String),
          field: 'email',
        },
        {
          message: expect.any(String),
          field: 'password',
        },
      ],
    });
  });

  it('DELETE/:id -> should delete user', async () => {
    const user = await utils.createUser(utils.createNewUserModel());
    await config
      .getHttp()
      .delete(`/sa/users/${user.id}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Basic ' + authBasic64)
      .expect(Status.NO_CONTENT);
  });

  it('POST, DELETE/:id -> should return error if auth credentials is incorrect', async () => {
    await config
      .getHttp()
      .post('/sa/users')
      .set('Content-Type', 'application/json')
      .send({
        ...utils.createNewUserModel(),
      })
      .expect(Status.UNATHORIZED);

    await config
      .getHttp()
      .post('/sa/users')
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Basic 123:123')
      .send({
        ...utils.createNewUserModel(),
      })
      .expect(Status.UNATHORIZED);

    const user = await utils.createUser(utils.createNewUserModel());

    await config.getHttp().delete(`/sa/users/${user.id}`).set('Content-Type', 'application/json').expect(Status.UNATHORIZED);

    await config
      .getHttp()
      .delete(`/sa/users/${user.id}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Basic 123:123')
      .expect(Status.UNATHORIZED);
  });

  it('DELETE/:id -> should return error id param not found', async () => {
    const user = await utils.createUser(utils.createNewUserModel());

    await config
      .getHttp()
      .delete(`/sa/users/${user.id}`)
      .set('Content-Type', 'application/json')
      .set('Authorization', 'Basic ' + authBasic64)
      .expect(Status.NO_CONTENT);

    await config
      .getHttp()
      .delete(`/sa/users/${user.id}`)
      .set('Authorization', 'Basic ' + authBasic64)
      .set('Content-Type', 'application/json')
      .expect(Status.NOT_FOUND);
  });
});
