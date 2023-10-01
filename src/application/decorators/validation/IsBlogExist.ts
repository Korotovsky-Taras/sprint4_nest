import { registerDecorator, ValidationOptions, ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator';
import { BlogsQueryRepository } from '../../../features/blogs/dao/blogs.query.repository';
import { BlogsDataMapper } from '../../../features/blogs/api/blogs.dm';
import { Injectable } from '@nestjs/common';

@Injectable()
@ValidatorConstraint({ async: true })
export class IsBlogIdExistValidator implements ValidatorConstraintInterface {
  constructor(private blogsQueryRepo: BlogsQueryRepository) {}
  validate(blogId: string) {
    return this.blogsQueryRepo.getBlogById(blogId, BlogsDataMapper.toBlogView).then((blog) => {
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
