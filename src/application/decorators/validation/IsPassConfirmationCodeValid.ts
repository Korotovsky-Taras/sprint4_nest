import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Inject, Injectable } from '@nestjs/common';
import { IUsersQueryRepository, UserQueryRepoKey } from '../../../features/users/types/common';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsPassConfirmationCodeValidator implements ValidatorConstraintInterface {
  constructor(@Inject(UserQueryRepoKey) private usersQueryRepo: IUsersQueryRepository) {}
  async validate(code: string) {
    const result = await this.usersQueryRepo.getPassConfirmationValidation(code);
    if (!result || result.isConfirmed) {
      return false; //code is not valid
    } else if (result.isExpired) {
      return false; //code is expired
    }
    return true;
  }
}

export function IsPassConfirmationCodeValid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsPassConfirmationCodeValid',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      async: true,
      validator: IsPassConfirmationCodeValidator,
    });
  };
}
