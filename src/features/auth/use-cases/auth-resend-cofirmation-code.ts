import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { UsersService } from '../../users/domain/users.service';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';
import { AuthResendingEmailDto } from '../dto/AuthResendingEmailDto';
import { GMailSender } from '../../../application/mails/GMailSender';
import { AuthServiceError } from '../types/errors';
import { Inject } from '@nestjs/common';
import { IUsersRepository, UserRepoKey } from '../../users/types/common';
import { UserEntityRepo } from '../../users/dao/user-entity.repo';

export class AuthResendConfirmationCodeCommand {
  constructor(public readonly dto: AuthResendingEmailDto) {}
}

@CommandHandler(AuthResendConfirmationCodeCommand)
export class AuthResendConfirmationCodeCase implements ICommandHandler<AuthResendConfirmationCodeCommand> {
  constructor(
    @Inject(UserRepoKey) private readonly usersRepo: IUsersRepository,
    private readonly usersService: UsersService,
    private readonly mailSender: GMailSender,
  ) {}

  async execute({ dto }: AuthResendConfirmationCodeCommand): Promise<ServiceResult> {
    await validateOrRejectDto(dto, AuthResendingEmailDto);

    const result = new ServiceResult();

    const user: UserEntityRepo | null = await this.usersRepo.getUserByEmail(dto.email);

    if (!user) {
      result.addError({
        code: AuthServiceError.AUTH_USER_NO_FOUND,
      });
      return result;
    }
    if (user.isAuthConfirmed()) {
      result.addError({
        code: AuthServiceError.AUTH_CODE_ALREADY_CONFIRMED,
      });
      return result;
    }

    user.setAuthConfirmation(this.usersService.createUserConfirmation());

    await user.save();

    await this.mailSender.sendRegistrationMail(user.email, user.authConfirmation.code).catch((e) => console.log(e));

    return result;
  }
}
