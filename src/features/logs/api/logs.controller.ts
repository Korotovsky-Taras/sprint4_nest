import { Controller, Get, HttpCode, Injectable, Res } from '@nestjs/common';
import { Status } from '../../../application/utils/types';
import path from 'node:path';
import { readFileSync } from 'node:fs';
import { Response } from 'express';

@Injectable()
@Controller('logs')
export class LogsController {
  @Get()
  @HttpCode(Status.OK)
  async getAll(@Res() res: Response) {
    const file = path.join(process.cwd(), 'public', '1.txt');
    const stringified = readFileSync(file, 'utf8');

    res.setHeader('Content-Type', 'application/text/plain');
    return res.end(stringified);
  }
}
