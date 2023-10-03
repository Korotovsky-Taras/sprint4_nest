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
