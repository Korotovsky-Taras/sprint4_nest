import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { UsersRepository } from '../dao/users.repository';
import { UserServiceError } from '../types/errors';

export class DeleteUserCommand {
  constructor(public readonly userId: string) {}
}

@CommandHandler(DeleteUserCommand)
export class DeleteUserCase implements ICommandHandler<DeleteUserCommand> {
  constructor(private readonly userModel: UsersRepository) {}

  async execute({ userId }: DeleteUserCommand): Promise<ServiceResult> {
    const result = new ServiceResult();

    const userExist: boolean = await this.userModel.isUserExist(userId);

    if (!userExist) {
      result.addError({
        code: UserServiceError.USER_NOT_FOUND,
      });
      return result;
    }

    const isDeleted = await this.userModel.deleteUserById(userId);

    if (!isDeleted) {
      result.addError({
        code: UserServiceError.USER_NOT_DELETED,
      });
    }

    return result;
  }
}
