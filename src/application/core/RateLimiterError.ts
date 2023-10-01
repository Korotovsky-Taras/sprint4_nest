import { HttpException } from '@nestjs/common/exceptions/http.exception';
import { Status } from '../utils/types';

export class RateLimiterError extends HttpException {
  constructor() {
    super('Too many requests', Status.TO_MANY_REQUESTS);
  }
}
