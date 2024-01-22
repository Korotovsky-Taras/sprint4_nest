import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { Status } from '../utils/types';
import { ConfigService } from '@nestjs/config';
import { AppConfiguration, AppDbType } from '../utils/config';

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
    const body = request.body;
    const query = request.query;

    const configService = new ConfigService<AppConfiguration, true>();
    const isDevMode = configService.get<AppDbType>('DEV_MODE');

    if (isDevMode) {
      console.log(`[body] ${JSON.stringify(body)}, [query] ${JSON.stringify(query)},`);
    }

    if (!(exception instanceof HttpException) || exception.getStatus() >= 500) {
      if (isDevMode) {
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
