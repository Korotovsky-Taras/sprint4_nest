import { ArgumentsHost, Catch, ExceptionFilter, HttpException } from '@nestjs/common';
import { Request, Response } from 'express';
import { toIsoString } from '../utils/date';
import { Status } from '../utils/types';

@Catch()
export class ServerExceptionFilter implements ExceptionFilter {
  private readonly isDevMode;

  constructor() {
    this.isDevMode = process.env.NODE_ENV != 'production';
  }

  catch(exception: Error | HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const path = request.url;
    const timestamp = toIsoString(new Date());

    const commonData = { timestamp, path };
    const responseData = this.isDevMode ? { stack: exception.stack?.toString(), ...commonData } : commonData;

    if (exception instanceof HttpException) {
      return response.status(exception.getStatus()).json(responseData);
    }

    response.status(Status.UNHANDLED).json(responseData);
  }
}
