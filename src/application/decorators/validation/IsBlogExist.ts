import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { Inject, Injectable } from '@nestjs/common';
import { BlogQueryRepoKey, IBlogsQueryRepository } from '../../../features/blogs/types/common';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsBlogIdExistValidator implements ValidatorConstraintInterface {
  constructor(@Inject(BlogQueryRepoKey) private blogsQueryRepo: IBlogsQueryRepository) {}
  validate(blogId: string) {
    return this.blogsQueryRepo.getBlogById(blogId).then((blog) => {
      return !!blog;
    });
  }
  defaultMessage(): string {
    return `BlogId not exist`;
  }
}

export function IsBlogExist(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'IsBlogExist',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      async: true,
      validator: IsBlogIdExistValidator,
    });
  };
}
