import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiValidationError } from '../core/ApiValidationError';
import { AppConfigService } from '../../app.config.service';

@Catch(ApiValidationError)
export class HttpExceptionFilter implements ExceptionFilter {
  constructor(private readonly configService: AppConfigService) {}
  catch(exception: ApiValidationError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const request = ctx.getRequest<Request>();
    const body = request.body;
    const query = request.query;

    if (this.configService.isDevMode()) {
      console.log(`[body] ${JSON.stringify(body)}, [query] ${JSON.stringify(query)},`);
    }

    response.status(status).send({
      errorsMessages: exception.errors,
    });
  }
}
