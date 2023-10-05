import { Module } from '@nestjs/common';
import { RateLimiter } from './application/rateLimiter';
import { RateLimiterGuard } from './application/guards/RateLimiterGuard';
import { AuthHelper } from './application/authHelper';

@Module({
  providers: [RateLimiter, RateLimiterGuard, AuthHelper],
  exports: [RateLimiter, RateLimiterGuard, AuthHelper],
})
export class SharedModule {}

//TODO сейчас не понятно как они работают в зависимостях
