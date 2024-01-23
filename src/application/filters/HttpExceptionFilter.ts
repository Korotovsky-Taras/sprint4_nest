import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiValidationError } from '../core/ApiValidationError';
import { ConfigService } from '@nestjs/config';
import { AppConfiguration, AppDbType } from '../utils/config';

@Catch(ApiValidationError)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: ApiValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const request = ctx.getRequest<Request>();
    const body = request.body;
    const query = request.query;

    const configService = new ConfigService<AppConfiguration, true>();
    const isDevMode = configService.get<AppDbType>('DEV_MODE');

    if (isDevMode) {
      console.log(`[body] ${JSON.stringify(body)}, [query] ${JSON.stringify(query)},`);
    }

    response.status(status).send({
      errorsMessages: exception.errors,
    });
  }
}
