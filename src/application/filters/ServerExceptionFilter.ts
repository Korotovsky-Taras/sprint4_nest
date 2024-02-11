import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { Status } from '../utils/types';
import { AppConfigService } from '../../app.config.service';

@Catch()
export class ServerExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly configService: AppConfigService,
    private readonly logger: Logger,
  ) {}

  catch(exception: Error | HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const path = request.url;
    const method = request.method;
    const body = request.body;
    const query = request.query;

    if (this.configService.isDevMode()) {
      console.log(`[body] ${JSON.stringify(body)}, [query] ${JSON.stringify(query)},`);
    }

    if (!(exception instanceof HttpException) || exception.getStatus() >= 500) {
      if (this.configService.isDevMode()) {
        console.log(`[${method}] ${path}`, exception.stack);
      }
      this.logger.error(`[${method}] ${path}`, exception.stack);
    }

    if (exception instanceof HttpException) {
      return response.sendStatus(exception.getStatus());
    }

    response.sendStatus(Status.UNHANDLED);
  }
}
