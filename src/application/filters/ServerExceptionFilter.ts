import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { Status } from '../utils/types';
import { ConfigService } from '@nestjs/config';

@Catch()
export class ServerExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly configService: ConfigService,
    private readonly logger: Logger,
  ) {}

  catch(exception: Error | HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const path = request.url;
    const method = request.method;

    if (!(exception instanceof HttpException) || exception.getStatus() >= 500) {
      this.logger.error(`[${method}] ${path}`, exception.stack);
    }

    if (exception instanceof HttpException) {
      return response.sendStatus(exception.getStatus());
    }

    response.sendStatus(Status.UNHANDLED);
  }
}
