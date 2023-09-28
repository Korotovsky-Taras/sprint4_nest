import { useTestDescribeConfig } from './utils/useTestDescribeConfig';

describe('AppConroller', () => {
  const config = useTestDescribeConfig();
  it('/ (GET)', () => {
    return config.getHttp().get('/').expect(200).expect('Hello World!');
  });
});
