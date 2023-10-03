import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersQueryRepository } from '../../../features/users/dao/users.query.repository';
import { UsersDataMapper } from '../../../features/users/api/users.dm';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsUniqueUserEmailValidator implements ValidatorConstraintInterface {
  constructor(private usersQueryRepo: UsersQueryRepository) {}
  validate(email: string) {
    return this.usersQueryRepo.getUserByFilter({ email }, UsersDataMapper.toUserView).then((user) => {
      return !!user;
    });
  }
  defaultMessage(): string {
    return `user not exist`;
  }
}

export function IsUniqueUserEmail(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsUniqueUserEmail',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      async: true,
      validator: IsUniqueUserEmailValidator,
    });
  };
}
