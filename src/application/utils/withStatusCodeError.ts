import { Status } from './types';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

export function withStatusCodeException(status: Status) {
  switch (status) {
    case Status.BAD_REQUEST:
      throw new BadRequestException();
    case Status.NOT_FOUND:
      throw new NotFoundException();
    case Status.FORBIDDEN:
      throw new ForbiddenException();
    default:
  }
}
