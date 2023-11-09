import { BadRequestException, createParamDecorator, ExecutionContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfiguration, AppDbType } from '../../utils/config';
import { isValidObjectId } from 'mongoose';

export const ParamId = createParamDecorator((data: unknown, ctx: ExecutionContext): string => {
  const request = ctx.switchToHttp().getRequest();
  const id = request.params.id;

  const configService = new ConfigService<AppConfiguration, true>();
  const dbType = configService.get<AppDbType>('DB_TYPE');

  if ((dbType === 'SQLRaw' && isNaN(Number(id))) || (dbType === 'Mongo' && !isValidObjectId(id))) {
    throw new BadRequestException('Invalid id parameter');
  }
  return id;
});