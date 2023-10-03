import { useTestDescribeConfig } from './utils/useTestDescribeConfig';
import { TestCreateUtils, UserCreationTestModel } from './utils/test.create.utils';
import { Status } from '../src/application/utils/types';
import { UserViewModel } from '../src/features/users/types/dto';

let userModel: UserCreationTestModel | null = null;
let user: UserViewModel | null = null;

const userAgents = ['app1', 'app2', 'app3', 'app4', 'app5'];

describe('security testing', () => {
  const config = useTestDescribeConfig();
  const utils = new TestCreateUtils(config);

  beforeAll(async () => {
    await config.getModels().clearAll();

    userModel = utils.createNewUserModel();
    user = await utils.createUser(userModel);
  });

  it('should not login by limiter', async () => {
    if (!userModel) {
      return;
    }

    for (const userAgent of userAgents) {
      await config
        .getHttp()
        .post(`/auth/login`)
        .set('Content-Type', 'application/json')
        .set('User-Agent', userAgent)
        .send({
          loginOrEmail: userModel.login,
          password: userModel.password,
        })
        .expect(Status.OK);
    }

    await config
      .getHttp()
      .post(`/auth/login`)
      .set('Content-Type', 'application/json')
      .set('User-Agent', userAgents[1])
      .send({
        loginOrEmail: userModel.login,
        password: userModel.password,
      })
      .expect(Status.TO_MANY_REQUESTS);
  });

  it('should login by limiter', async () => {
    if (!userModel) {
      return;
    }

    await utils.wait(10);

    for (const userAgent of userAgents) {
      await config
        .getHttp()
        .post(`/auth/login`)
        .set('Content-Type', 'application/json')
        .set('User-Agent', userAgent)
        .send({
          loginOrEmail: userModel.login,
          password: userModel.password,
        })
        .expect(Status.OK);
    }

    await utils.wait(10);

    await config
      .getHttp()
      .post(`/auth/login`)
      .set('Content-Type', 'application/json')
      .set('User-Agent', userAgents[1])
      .send({
        loginOrEmail: userModel.login,
        password: userModel.password,
      })
      .expect(Status.OK);
  });
});
