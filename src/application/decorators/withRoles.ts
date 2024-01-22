import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { RolesGuard } from '../guards/RolesGuard';

export function WithRoles(...roles: string[]) {
  return applyDecorators(SetMetadata('roles', roles), UseGuards(RolesGuard));
}
