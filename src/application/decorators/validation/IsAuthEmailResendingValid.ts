import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersQueryRepository } from '../../../features/users/dao/users.query.repository';
import { UsersDataMapper } from '../../../features/users/api/users.dm';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsAuthEmailResendingValidator implements ValidatorConstraintInterface {
  constructor(private usersQueryRepo: UsersQueryRepository) {}
  async validate(email: string) {
    const user = await this.usersQueryRepo.getUserByFilter({ email }, UsersDataMapper.toUserWithAuthConfirmation);
    if (!user) {
      return false; //email doesnt exist
    } else if (user.confirmed) {
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
