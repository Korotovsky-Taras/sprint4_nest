import { appDescribe } from './utils/appDescribe';

appDescribe((appConsumer) => {
  it('/ (GET)', () => {
    return appConsumer.getHttp().get('/').expect(200).expect('Hello World!');
  });
});
