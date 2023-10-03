import { Module } from '@nestjs/common';
import { RateLimiter } from './application/rateLimiter';
import { RateLimiterGuard } from './application/guards/RateLimiterGuard';
import { AuthHelper } from './application/authHelper';
import { MailSender } from './application/mailSender';
import { MailAdapter } from './application/adapters/mail.adapter';

@Module({
  providers: [RateLimiter, RateLimiterGuard, AuthHelper, MailSender, MailAdapter],
  exports: [RateLimiter, RateLimiterGuard, AuthHelper, MailSender, MailAdapter],
})
export class SharedModule {}

//TODO сейчас не понятно как они работают в зависимостях
