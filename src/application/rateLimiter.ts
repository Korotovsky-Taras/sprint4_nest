import { toIsoString } from './utils/date';
import { Injectable } from '@nestjs/common';

export type RateLimiterCounter = {
  value: number;
  exp: string;
};

@Injectable()
export class ReteLimiter {
  constructor(private readonly redis = new Map<string, RateLimiterCounter>()) {}

  getCounter(key: string): RateLimiterCounter | undefined {
    return this.redis.get(key);
  }

  incCounter(key: string) {
    const rateLimiterValue: RateLimiterCounter | undefined = this.redis.get(key);
    if (rateLimiterValue) {
      this.redis.set(key, {
        ...rateLimiterValue,
        value: rateLimiterValue.value + 1,
      });
    }
  }

  setCounter(key: string, val: number, seconds: number) {
    const expDate = new Date().getTime() + seconds * 1000;
    this.redis.set(key, {
      exp: toIsoString(new Date(expDate)),
      value: val,
    });
  }

  getTtl(key: string) {
    const rateLimiterValue: RateLimiterCounter | undefined = this.redis.get(key);
    if (rateLimiterValue) {
      const expTime = new Date(rateLimiterValue.exp).getTime();
      const curTime = new Date().getTime();
      return (expTime - curTime) / 1000;
    }
    return -1;
  }
}

export const rateLimiter = new ReteLimiter();
