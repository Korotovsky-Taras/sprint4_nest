import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersQueryRepository } from '../../../features/users/dao/users.query.repository';

//TODO возможно стоит объединить через конструктор с IsUniqueUserEmail
@Injectable()
@ValidatorConstraint({ async: true })
export class IsUniqueUserLoginValidator implements ValidatorConstraintInterface {
  constructor(private usersQueryRepo: UsersQueryRepository) {}
  async validate(login: string) {
    const isUserWithLoginExist = await this.usersQueryRepo.isUserExistByLoginOrEmail(login, '');
    return !isUserWithLoginExist;
  }
  defaultMessage(): string {
    return `user with login exist`;
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
