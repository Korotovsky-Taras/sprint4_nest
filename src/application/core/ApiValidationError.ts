import { BadRequestException } from '@nestjs/common';
import { FieldError } from '../utils/types';

export class ApiValidationError extends BadRequestException {
  constructor(public readonly errors: FieldError[]) {
    super();
  }
}
