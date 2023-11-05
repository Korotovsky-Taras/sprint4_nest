import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { UserServiceError } from '../types/errors';
import { Inject } from '@nestjs/common';
import { IUsersRepository, UserRepoKey } from '../types/common';

export class DeleteUserCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserCase implements ICommandHandler<DeleteUserCommand> {
  constructor(@Inject(UserRepoKey) private readonly usersRepo: IUsersRepository) {}

  async execute({ userId }: DeleteUserCommand): Promise<ServiceResult> {
    const result = new ServiceResult();

    const userExist: boolean = await this.usersRepo.isUserExist(userId);

    if (!userExist) {
      result.addError({
        code: UserServiceError.USER_NOT_FOUND,
      });
      return result;
    }

    const isDeleted = await this.usersRepo.deleteUserById(userId);

    if (!isDeleted) {
      result.addError({
        code: UserServiceError.USER_NOT_DELETED,
      });
    }

    return result;
  }
}
