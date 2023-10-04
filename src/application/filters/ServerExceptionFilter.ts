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

    // if (this.isDevMode) {
    const commonData = { timestamp, path };

    if (exception instanceof HttpException && exception.getStatus()) {
      const responseData = exception.getStatus() >= 500 ? { stack: exception.stack?.toString(), ...commonData } : commonData;
      console.log({ responseData });
      return response.status(exception.getStatus()).json(responseData);
    }

    console.log({ commonData });
    return response.status(Status.UNHANDLED).json(commonData);

    // }
    //
    // response.sendStatus(Status.UNHANDLED);
  }
}
