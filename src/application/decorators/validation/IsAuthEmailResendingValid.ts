import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Inject, Injectable } from '@nestjs/common';
import { IUsersQueryRepository, UserQueryRepoKey } from '../../../features/users/types/common';
import { UserConfirmation } from '../../../features/users/types/dao';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsAuthEmailResendingValidator implements ValidatorConstraintInterface {
  constructor(@Inject(UserQueryRepoKey) private usersQueryRepo: IUsersQueryRepository) {}
  async validate(email: string) {
    const userConfirmation: UserConfirmation | null = await this.usersQueryRepo.getUserRegistrationConfirmationByEmail(email);
    if (userConfirmation === null) {
      return false; //email doesnt exist
    } else if (userConfirmation.confirmed) {
      return false; //email already confirmed
    }
    return true;
  }
}

export function IsAuthEmailResendingValid(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsAuthEmailResendingValid',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      async: true,
      validator: IsAuthEmailResendingValidator,
    });
  };
}
