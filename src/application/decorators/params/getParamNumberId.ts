import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfiguration, AppDbType } from '../../utils/config';
import { isValidObjectId } from 'mongoose';
import { ApiValidationError } from '../../core/ApiValidationError';

export const ParamId = createParamDecorator((data: string, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();
  const id = request.params[data];

  const configService = new ConfigService<AppConfiguration, true>();
  const dbType = configService.get<AppDbType>('DB_TYPE');

  if (id && ((dbType === 'SQLRaw' && isNaN(Number(id))) || (dbType === 'Mongo' && !isValidObjectId(id)))) {
    throw new ApiValidationError([
      {
        message: 'Invalid id parameter',
        field: 'id',
      },
    ]);
  }
  return id;
});
