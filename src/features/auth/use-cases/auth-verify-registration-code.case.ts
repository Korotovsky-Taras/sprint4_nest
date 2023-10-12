import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';
import { AuthConfirmationCodeDto } from '../dto/AuthConfirmationCodeDto';
import { UserDocumentType } from '../../users/types/dao';
import { UsersRepository } from '../../users/dao/users.repository';
import { AuthServiceError } from '../types/errors';

export class AuthVerifyRegistrationCodeCommand {
  constructor(public readonly dto: AuthConfirmationCodeDto) {}
}

@CommandHandler(AuthVerifyRegistrationCodeCommand)
export class AuthVerifyRegistrationCodeCase implements ICommandHandler<AuthVerifyRegistrationCodeCommand> {
  constructor(private readonly usersRepo: UsersRepository) {}

  async execute({ dto }: AuthVerifyRegistrationCodeCommand): Promise<ServiceResult> {
    await validateOrRejectDto(dto, AuthConfirmationCodeDto);

    const result = new ServiceResult();
    const user: UserDocumentType | null = await this.usersRepo.getUserByAuthConfirmationCode(dto.code);

    if (user === null || user.isAuthConfirmed() || user.isAuthExpired()) {
      result.addError({
        code: AuthServiceError.AUTH_REG_CONFIRMATION_INVALID,
      });
      return result;
    }

    user.setAuthConfirmed(true);
    await this.usersRepo.saveDoc(user);

    return result;
  }
}
