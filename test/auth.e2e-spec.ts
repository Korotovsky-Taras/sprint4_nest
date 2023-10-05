import { useTestDescribeConfig } from './utils/useTestDescribeConfig';
import { TestCreateUtils, UserCreationTestModel } from './utils/test.create.utils';
import { Status } from '../src/application/utils/types';
import { TestCookieUtils } from './utils/test.cookie.utils';

let userModel: UserCreationTestModel | null = null;
let refreshToken: string | null = null;

describe('auth testing', () => {
  const config = useTestDescribeConfig();
  const utils = new TestCreateUtils(config);
  const cookieUtils = new TestCookieUtils();

  beforeAll(async () => {
    await config.getModels().clearAll();

    userModel = await utils.createNewUserModel();
    await utils.createUser(userModel);
    refreshToken = null;
  });

  it('POST - auth/registration -> should return 404 if dto incorrect', async () => {
    const usrModel1 = utils.createNewUserModel();
    const usrModel2 = utils.createNewUserModel();

    await utils.createUser(usrModel1);
    await utils.createUser(usrModel2);

    //попытка регистрации существующего login
    const regModel = utils.createNewUserModel();
    const res1 = await config
      .getHttp()
      .post(`/auth/registration`)
      .set('Content-Type', 'application/json')
      .send({
        login: usrModel1.login,
        email: regModel.email,
        password: regModel.password,
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

    //попытка регистрации существующего email
    const res2 = await config
      .getHttp()
      .post(`/auth/registration`)
      .set('Content-Type', 'application/json')
      .send({
        login: regModel.login,
        email: usrModel1.email,
        password: regModel.password,
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
  });

  it('POST - auth/registration -> should create user with confirmation code', async () => {
    const usrModel = utils.createNewUserModel();

    await config
      .getHttp()
      .post(`/auth/registration`)
      .set('Content-Type', 'application/json')
      .send({
        login: usrModel.login,
        email: usrModel.email,
        password: usrModel.password,
      })
      .expect(Status.NO_CONTENT);

    const result = await config
      .getModels()
      .getUserModel()
      .findOne({ login: usrModel?.login })
      .exec();

    expect(result).not.toBeUndefined();
    expect(result?.authConfirmation.confirmed).toBeFalsy();
    expect(result?.authConfirmation.code).not.toBeUndefined();
  });

  it('POST - auth/registration -> confirmation -> should confirm code', async () => {
    const usrModel = utils.createNewUserModel();

    await config
      .getHttp()
      .post(`/auth/registration`)
      .set('Content-Type', 'application/json')
      .send({
        login: usrModel.login,
        email: usrModel.email,
        password: usrModel.password,
      })
      .expect(Status.NO_CONTENT);

    const result = await config
      .getModels()
      .getUserModel()
      .findOne({ login: usrModel?.login })
      .exec();

    expect(result).not.toBeUndefined();
    expect(result?.authConfirmation.confirmed).toBeFalsy();
    expect(result?.authConfirmation.code).not.toBeUndefined();

    await config
      .getHttp()
      .post(`/auth/registration-confirmation`)
      .set('Content-Type', 'application/json')
      .send({
        code: result?.authConfirmation.code,
      })
      .expect(Status.NO_CONTENT);

    const result2 = await config
      .getModels()
      .getUserModel()
      .findOne({ login: usrModel?.login })
      .exec();

    expect(result2?.authConfirmation.confirmed).toBeTruthy();
  });

  it('should return 401 if wrong password or email', async () => {
    const fakeUserModel = utils.createNewUserModel();

    await config
      .getHttp()
      .post(`/auth/login`)
      .set('Content-Type', 'application/json')
      .send({
        loginOrEmail: fakeUserModel.login,
        password: fakeUserModel.password,
      })
      .expect(Status.UNATHORIZED);
  });

  it('should return accessToken ', async () => {
    if (!userModel) {
      return;
    }

    const res = await config
      .getHttp()
      .post(`/auth/login`)
      .set('Content-Type', 'application/json')
      .send({
        loginOrEmail: userModel.login,
        password: userModel.password,
      })
      .expect(Status.OK);

    expect(res.body).toEqual({
      accessToken: expect.any(String),
    });

    const cookie = cookieUtils.extractCookie(res, 'refreshToken');

    expect(cookie).not.toBeUndefined();
    refreshToken = cookie!.value;
  });

  it('should refresh tokens', async () => {
    expect(refreshToken).not.toBeNull();

    const res = await config
      .getHttp()
      .post(`/auth/refresh-token`)
      .set('Content-Type', 'application/json')
      .set('Cookie', [
        cookieUtils.createCookie({
          refreshToken,
          Path: '/',
          HttpOnly: true,
          Secure: true,
        }),
      ])
      .send({})
      .expect(Status.OK);

    const cookie = cookieUtils.extractCookie(res, 'refreshToken');

    expect(cookie).not.toBeUndefined();
    expect(cookie!.value).not.toEqual(refreshToken);
    refreshToken = cookie!.value;
  });

  it('should logout 204', async () => {
    expect(refreshToken).not.toBeNull();

    const res = await config
      .getHttp()
      .post(`/auth/logout`)
      .set('Content-Type', 'application/json')
      .set('Cookie', [
        cookieUtils.createCookie({
          refreshToken,
          Path: '/',
          HttpOnly: true,
          Secure: true,
        }),
      ])
      .send({})
      .expect(Status.NO_CONTENT);

    const cookie = cookieUtils.extractCookie(res, 'refreshToken');

    expect(cookie).not.toBeUndefined();
    expect(cookie!.value).not.toEqual(refreshToken);
  });

  it('should return error if passed wrong login or password; status 401;', async () => {
    if (!userModel) {
      return;
    }
    await config
      .getHttp()
      .post(`/auth/login`)
      .set('Content-Type', 'application/json')
      .send({
        loginOrEmail: userModel.login,
        password: 'wrong password',
      })
      .expect(Status.UNATHORIZED);
  });
});
