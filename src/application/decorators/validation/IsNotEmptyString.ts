import { isNotEmpty, isString, registerDecorator, ValidationOptions } from 'class-validator';

export function IsNotEmptyString(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isNotEmptyString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return isString(value) && isNotEmpty(value.trim());
        },
        defaultMessage(): string {
          return `${propertyName} should be a none empty string`;
        },
      },
    });
  };
}
