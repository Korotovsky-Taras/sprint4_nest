import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';
import { AuthServiceError } from '../types/errors';
import { AuthNewPasswordDto } from '../dto/AuthNewPasswordDto';
import { UsersService } from '../../users/domain/users.service';
import { Inject } from '@nestjs/common';
import { IUsersRepository, UserRepoKey } from '../../users/types/common';
import { UserEntityRepo } from '../../users/dao/user-entity.repo';

export class AuthRecoverPasswordWithCodeCommand {
  constructor(public readonly dto: AuthNewPasswordDto) {}
}

@CommandHandler(AuthRecoverPasswordWithCodeCommand)
export class AuthRecoverPasswordWithCodeCase implements ICommandHandler<AuthRecoverPasswordWithCodeCommand> {
  constructor(
    @Inject(UserRepoKey) private readonly usersRepo: IUsersRepository,
    private readonly userService: UsersService,
  ) {}

  async execute({ dto }: AuthRecoverPasswordWithCodeCommand): Promise<ServiceResult> {
    await validateOrRejectDto(dto, AuthNewPasswordDto);

    const result = new ServiceResult();
    const user: UserEntityRepo | null = await this.usersRepo.getUserByPassConfirmationCode(dto.recoveryCode);

    if (user === null || user.isPassExpired() || user.isPassConfirmed()) {
      result.addError({
        code: AuthServiceError.AUTH_PASS_CONFIRMATION_INVALID,
      });
      return result;
    }

    user.setPassword(this.userService.hashPassword(dto.newPassword));
    user.setPassConfirmed(true);

    await user.save();

    return result;
  }
}
