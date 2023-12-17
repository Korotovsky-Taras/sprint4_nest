import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';
import { AuthConfirmationCodeDto } from '../dto/AuthConfirmationCodeDto';
import { AuthServiceError } from '../types/errors';
import { Inject } from '@nestjs/common';
import { IUsersRepository, UserRepoKey } from '../../users/types/common';
import { UserEntityRepo } from '../../users/dao/user-entity.repo';

export class AuthVerifyRegistrationCodeCommand {
  constructor(public readonly dto: AuthConfirmationCodeDto) {}
}

@CommandHandler(AuthVerifyRegistrationCodeCommand)
export class AuthVerifyRegistrationCodeCase implements ICommandHandler<AuthVerifyRegistrationCodeCommand> {
  constructor(@Inject(UserRepoKey) private readonly usersRepo: IUsersRepository<any>) {}

  async execute({ dto }: AuthVerifyRegistrationCodeCommand): Promise<ServiceResult> {
    await validateOrRejectDto(dto, AuthConfirmationCodeDto);

    const result = new ServiceResult();
    const user: UserEntityRepo | null = await this.usersRepo.getUserByAuthConfirmationCode(dto.code);

    if (user === null || user.isAuthConfirmed() || user.isAuthExpired()) {
      result.addError({
        code: AuthServiceError.AUTH_REG_CONFIRMATION_INVALID,
      });
      return result;
    }

    user.setAuthConfirmed(true);
    await user.save();

    return result;
  }
}
