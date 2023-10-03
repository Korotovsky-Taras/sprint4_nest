import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersQueryRepository } from '../../../features/users/dao/users.query.repository';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsAuthConfirmationCodeValidator implements ValidatorConstraintInterface {
  constructor(private usersQueryRepo: UsersQueryRepository) {}
  async validate(code: string) {
    const result = await this.usersQueryRepo.getAuthConfirmationValidation(code);
    if (!result || result.isConfirmed) {
      throw Error('code is not valid');
    } else if (result.isExpired) {
      throw Error('code is expired');
    }
    return true;
  }
}

export function IsAuthConfirmationCodeValid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsAuthConfirmationCodeValid',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      async: true,
      validator: IsAuthConfirmationCodeValidator,
    });
  };
}
