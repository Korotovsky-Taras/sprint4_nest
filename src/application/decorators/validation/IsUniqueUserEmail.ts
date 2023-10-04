import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { UsersQueryRepository } from '../../../features/users/dao/users.query.repository';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsUniqueUserEmailValidator implements ValidatorConstraintInterface {
  constructor(private usersQueryRepo: UsersQueryRepository) {}
  async validate(email: string) {
    const isUserWithEmailExist = await this.usersQueryRepo.isUserExistByLoginOrEmail('', email);
    return !isUserWithEmailExist;
  }
  defaultMessage(): string {
    return `user with email exist`;
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
