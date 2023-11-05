import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Inject, Injectable } from '@nestjs/common';
import { IUsersQueryRepository, UserQueryRepoKey } from '../../../features/users/types/common';

//TODO возможно стоит объединить через конструктор с IsUniqueUserEmail
@Injectable()
@ValidatorConstraint({ async: true })
export class IsUniqueUserLoginValidator implements ValidatorConstraintInterface {
  constructor(@Inject(UserQueryRepoKey) private usersQueryRepo: IUsersQueryRepository) {}
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
