import { useAppDescribe } from './utils/appDescribe';

describe('AppConroller', () => {
  const appConsumer = useAppDescribe();
  it('/ (GET)', () => {
    return appConsumer.getHttp().get('/').expect(200).expect('Hello World!');
  });
});
