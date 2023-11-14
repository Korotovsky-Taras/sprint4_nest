import { Controller, Get, HttpCode, Injectable, Query } from '@nestjs/common';
import { Status } from '../../../application/utils/types';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { LogsQueryDto } from '../dto/LogsQueryDto';

@Injectable()
@Controller('logs')
export class LogsController {
  @Get()
  @HttpCode(Status.OK)
  async getAll(@Query() query: LogsQueryDto) {
    const level = query.level ? query.level : 'combined';
    const file = path.join(process.cwd(), 'public', 'logs', `${level}.log`);
    const buffer = readFileSync(file, 'utf8');
    return buffer.toString();
  }
}
