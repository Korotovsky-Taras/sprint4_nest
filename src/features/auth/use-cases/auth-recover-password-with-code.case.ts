import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';
import { UserDocumentType } from '../../users/types/dao';
import { UsersRepository } from '../../users/dao/users.repository';
import { AuthServiceError } from '../types/errors';
import { AuthNewPasswordDto } from '../dto/AuthNewPasswordDto';
import { UsersService } from '../../users/domain/users.service';

export class AuthRecoverPasswordWithCodeCommand {
  constructor(public readonly dto: AuthNewPasswordDto) {}
}

@CommandHandler(AuthRecoverPasswordWithCodeCommand)
export class AuthRecoverPasswordWithCodeCase implements ICommandHandler<AuthRecoverPasswordWithCodeCommand> {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly userService: UsersService,
  ) {}

  async execute({ dto }: AuthRecoverPasswordWithCodeCommand): Promise<ServiceResult> {
    await validateOrRejectDto(dto, AuthNewPasswordDto);

    const result = new ServiceResult();
    const user: UserDocumentType | null = await this.usersRepo.getUserByPassConfirmationCode(dto.recoveryCode);

    if (user === null || user.isPassExpired() || user.isPassConfirmed()) {
      result.addError({
        code: AuthServiceError.AUTH_PASS_CONFIRMATION_INVALID,
      });
      return result;
    }

    user.password = this.userService.hashPassword(dto.newPassword);
    user.setPassConfirmed(true);

    await this.usersRepo.saveDoc(user);

    return result;
  }
}
