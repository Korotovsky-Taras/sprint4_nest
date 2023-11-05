import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Inject, Injectable } from '@nestjs/common';
import { IUsersQueryRepository, UserQueryRepoKey } from '../../../features/users/types/common';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsAuthConfirmationCodeValidator implements ValidatorConstraintInterface {
  constructor(@Inject(UserQueryRepoKey) private usersQueryRepo: IUsersQueryRepository) {}
  async validate(code: string) {
    const result = await this.usersQueryRepo.getAuthConfirmationValidation(code);
    if (!result || result.isConfirmed) {
      return false; //code is not valid
    } else if (result.isExpired) {
      return false; //code is expired
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
