import { randomUUID, UUID } from 'crypto';
import { testInit } from './utils/test.init';
import { TestCreateUtils, UserCreationTestModel } from './utils/test.create.utils';
import { Cookie, SessionUnit, TestCookieUtils } from './utils/test.cookie.utils';
import { AuthRefreshTokenPayload } from '../src/features/auth/utils/tokenCreator.types';
import { Status } from '../src/application/utils/types';

let userModel1: UserCreationTestModel | null = null;
let userModel2: UserCreationTestModel | null = null;

const userAgents = ['app1', 'app1', 'app1', 'app1'];
let user1Sessions: SessionUnit[] = [];
const user2Sessions: SessionUnit[] = [];

function removeUser1Session(sessionUuid: UUID) {
  user1Sessions = user1Sessions.filter((session) => session.uuid != sessionUuid);
}

function getUser1Session(index: number): SessionUnit {
  const session = user1Sessions[index];
  if (session === undefined) {
    throw Error('Session index error');
  }
  return session;
}

describe('security testing', () => {
  const config = testInit();
  const utils = new TestCreateUtils(config);
  const cookieUtils = new TestCookieUtils(config);

  beforeAll(async () => {
    await config.getDaoUtils().clearAll();

    userModel1 = utils.createNewUserModel();
    userModel2 = utils.createNewUserModel();

    await utils.createUser(userModel1);
    await utils.createUser(userModel2);

    user1Sessions.length = 0;
    user2Sessions.length = 0;
  });

  it('should login user on 4 devices', async () => {
    if (!userModel1) {
      return;
    }

    for (const userAgent of userAgents) {
      const res = await config
        .getHttp()
        .post(`/auth/login`)
        .set('Content-Type', 'application/json')
        .set('User-Agent', userAgent)
        .send({
          loginOrEmail: userModel1.login,
          password: userModel1.password,
        })
        .expect(Status.OK);

      expect(res.body).toEqual({
        accessToken: expect.any(String),
      });

      const cookie: Cookie | undefined = cookieUtils.extractCookie(res, 'refreshToken');

      if (cookie) {
        const payload: AuthRefreshTokenPayload | null = cookieUtils.verifyRefreshToken(cookie);
        if (payload) {
          user1Sessions.push({
            uuid: randomUUID(),
            payload,
            refreshToken: cookie.value,
          });
        }
      }
    }

    expect(user1Sessions).toHaveLength(userAgents.length);

    const session = getUser1Session(0);

    const res = await config
      .getHttp()
      .get(`/security/devices`)
      .set('Cookie', [
        cookieUtils.createCookie({
          refreshToken: session.refreshToken,
          Path: '/',
          HttpOnly: true,
          Secure: true,
        }),
      ])
      .expect(Status.OK);

    expect(res.body).toHaveLength(userAgents.length);
  });

  it('should update refreshToken 1 device', async () => {
    const session: SessionUnit = getUser1Session(0);

    const res = await config
      .getHttp()
      .post(`/auth/refresh-token`)
      .set('Cookie', [
        cookieUtils.createCookie({
          refreshToken: session.refreshToken,
          Path: '/',
          HttpOnly: true,
          Secure: true,
        }),
      ])
      .expect(Status.OK);

    const cookie = cookieUtils.extractCookie(res, 'refreshToken');

    expect(cookie).not.toBeUndefined();
    expect(cookie!.value).not.toEqual(session.refreshToken);

    cookieUtils.refreshCookie(cookie, session);
  });

  it('should return list of 4 devices too', async () => {
    const session: SessionUnit = getUser1Session(0);

    const res = await config
      .getHttp()
      .get(`/security/devices`)
      .set('Cookie', [
        cookieUtils.createCookie({
          refreshToken: session.refreshToken,
          Path: '/',
          HttpOnly: true,
          Secure: true,
        }),
      ])
      .expect(Status.OK);

    expect(res.body).toHaveLength(4);
  });

  it('should delete 2cond device', async () => {
    const session0 = getUser1Session(0);
    const session1 = getUser1Session(1);

    //удаляем вторую сессию, первой сессией
    await config
      .getHttp()
      .delete(`/security/devices/${session1.payload.deviceId}`)
      .set('Cookie', [
        cookieUtils.createCookie({
          refreshToken: session0.refreshToken,
          Path: '/',
          HttpOnly: true,
          Secure: true,
        }),
      ])
      .expect(Status.NO_CONTENT);

    removeUser1Session(session1.uuid);

    const res = await config
      .getHttp()
      .get(`/security/devices`)
      .set('Cookie', [
        cookieUtils.createCookie({
          refreshToken: session0.refreshToken,
          Path: '/',
          HttpOnly: true,
          Secure: true,
        }),
      ]);

    expect(res.body).toHaveLength(3);

    await config
      .getHttp()
      .delete(`/security/devices/${session0.payload.deviceId}`)
      .set('Cookie', [
        cookieUtils.createCookie({
          refreshToken: session1.refreshToken,
          Path: '/',
          HttpOnly: true,
          Secure: true,
        }),
      ])
      .expect(Status.UNATHORIZED);
  });

  it('should logout device session', async () => {
    const session1 = getUser1Session(0);

    expect(session1).not.toBeUndefined();

    await config
      .getHttp()
      .post(`/auth/logout`)
      .set('Cookie', [
        cookieUtils.createCookie({
          refreshToken: session1.refreshToken,
          Path: '/',
          HttpOnly: true,
          Secure: true,
        }),
      ])
      .expect(Status.NO_CONTENT);

    removeUser1Session(session1.uuid);

    const session2 = getUser1Session(0);

    const res = await config
      .getHttp()
      .get(`/security/devices`)
      .set('Cookie', [
        cookieUtils.createCookie({
          refreshToken: session2.refreshToken,
          Path: '/',
          HttpOnly: true,
          Secure: true,
        }),
      ])
      .expect(Status.OK);

    expect(res.body).toHaveLength(2);
  });

  it('should remove all devices expect device 1', async () => {
    const session = getUser1Session(0);

    await config
      .getHttp()
      .delete(`/security/devices`)
      .set('Cookie', [
        cookieUtils.createCookie({
          refreshToken: session.refreshToken,
          Path: '/',
          HttpOnly: true,
          Secure: true,
        }),
      ])
      .expect(Status.NO_CONTENT);

    user1Sessions.forEach(({ uuid }) => {
      if (uuid != session.uuid) {
        removeUser1Session(uuid);
      }
    });

    const res = await config
      .getHttp()
      .get(`/security/devices`)
      .set('Cookie', [
        cookieUtils.createCookie({
          refreshToken: session.refreshToken,
          Path: '/',
          HttpOnly: true,
          Secure: true,
        }),
      ])
      .expect(Status.OK);

    expect(res.body).toHaveLength(1);
  });

  it('should return 403 when user1 try logout user2', async () => {
    if (!userModel2) {
      return;
    }

    const user1Session = getUser1Session(0);

    const res = await config
      .getHttp()
      .post(`/auth/login`)
      .set('Content-Type', 'application/json')
      .send({
        loginOrEmail: userModel2.login,
        password: userModel2.password,
      })
      .expect(Status.OK);

    const cookie: Cookie | undefined = cookieUtils.extractCookie(res, 'refreshToken');

    if (!cookie) {
      throw Error();
    }

    const payload: AuthRefreshTokenPayload | null = cookieUtils.verifyRefreshToken(cookie);
    if (!payload) {
      throw Error();
    }

    await config
      .getHttp()
      .post(`/auth/logout`)
      .set('Cookie', [
        cookieUtils.createCookie({
          refreshToken: cookieUtils.createRefreshToken(payload.userId, user1Session.payload.deviceId),
          Path: '/',
          HttpOnly: true,
          Secure: true,
        }),
      ])
      .expect(Status.UNATHORIZED);
  });
});
