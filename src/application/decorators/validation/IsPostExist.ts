import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Injectable } from '@nestjs/common';
import { PostsQueryRepository } from '../../../features/posts/dao/posts.query.repository';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsPostIdExistValidator implements ValidatorConstraintInterface {
  constructor(private postsQueryRepo: PostsQueryRepository) {}
  async validate(postId: string) {
    return await this.postsQueryRepo.isPostExist(postId);
  }
  defaultMessage(): string {
    return `PostId not exist`;
  }
}

export function IsPostExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsPostExist',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      async: true,
      validator: IsPostIdExistValidator,
    });
  };
}
