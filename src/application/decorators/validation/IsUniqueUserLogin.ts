import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersQueryRepository } from '../../../features/users/dao/users.query.repository';
import { UsersDataMapper } from '../../../features/users/api/users.dm';

//TODO возможно стоит объединить через конструктор с IsUniqueUserEmail
@Injectable()
@ValidatorConstraint({ async: true })
export class IsUniqueUserLoginValidator implements ValidatorConstraintInterface {
  constructor(private usersQueryRepo: UsersQueryRepository) {}
  validate(login: string) {
    return this.usersQueryRepo.getUserByFilter({ login }, UsersDataMapper.toUserView).then((user) => {
      return !!user;
    });
  }
  defaultMessage(): string {
    return `email not exist`;
  }
}

export function IsUniqueUserLogin(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsUniqueUserLogin',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      async: true,
      validator: IsUniqueUserLoginValidator,
    });
  };
}
