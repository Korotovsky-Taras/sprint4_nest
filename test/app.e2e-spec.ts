import { testInit } from './utils/test.init';

describe('AppConroller', () => {
  const config = testInit();
  it('/ (GET)', () => {
    return config.getHttp().get('/').expect(200).expect('Hello World!');
  });
});
