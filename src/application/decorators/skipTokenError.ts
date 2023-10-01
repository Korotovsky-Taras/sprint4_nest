import { SetMetadata } from '@nestjs/common';

export interface TokenGuardParamType {
  throwError: boolean;
}

export const SetTokenGuardParams = (params: TokenGuardParamType | boolean) =>
  SetMetadata('tokenGuardParams', typeof params === 'boolean' ? { throwError: params } : params);
