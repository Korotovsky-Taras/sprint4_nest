import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Inject, Injectable } from '@nestjs/common';
import { IUsersQueryRepository, UserQueryRepoKey } from '../../../features/users/types/common';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsUniqueUserEmailValidator implements ValidatorConstraintInterface {
  constructor(@Inject(UserQueryRepoKey) private usersQueryRepo: IUsersQueryRepository) {}
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
