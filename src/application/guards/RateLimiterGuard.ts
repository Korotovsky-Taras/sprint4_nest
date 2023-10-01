import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { RateLimiterCounter, ReteLimiter } from '../rateLimiter';
import { AuthHelper } from '../authHelper';
import { RateLimiterError } from '../core/RateLimiterError';

@Injectable()
export class RateLimiterGuard implements CanActivate {
  private limit: number = 5;
  private period: number = 10;

  constructor(
    private authHelper: AuthHelper,
    private rateLimiter: ReteLimiter,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const ip = this.authHelper.getIp(request);

    if (!ip) {
      return true;
    }

    const endpoint = request.path;

    const key = `${ip}:${endpoint}`;

    const count: RateLimiterCounter | undefined = this.rateLimiter.getCounter(key);

    if (!count || this.rateLimiter.getTtl(key) < 0) {
      await this.rateLimiter.setCounter(key, 1, this.period);
      return true;
    }

    await this.rateLimiter.incCounter(key);

    if (count.value < this.limit) {
      return true;
    }

    throw new RateLimiterError();
  }
}
