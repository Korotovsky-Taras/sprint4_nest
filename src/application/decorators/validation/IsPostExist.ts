import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Inject, Injectable } from '@nestjs/common';
import { IPostsQueryRepository, PostQueryRepoKey } from '../../../features/posts/types/common';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsPostIdExistValidator implements ValidatorConstraintInterface {
  constructor(@Inject(PostQueryRepoKey) private postsQueryRepo: IPostsQueryRepository) {}
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
