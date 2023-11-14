import { Module } from '@nestjs/common';
import { LogsController } from './api/logs.controller';

@Module({
  controllers: [LogsController],
})
export class LogsModule {}
