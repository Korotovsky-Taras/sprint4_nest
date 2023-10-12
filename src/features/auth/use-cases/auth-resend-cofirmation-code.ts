import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { UsersService } from '../../users/domain/users.service';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';
import { AuthResendingEmailDto } from '../dto/AuthResendingEmailDto';
import { UserDocumentType } from '../../users/types/dao';
import { UsersRepository } from '../../users/dao/users.repository';
import { GMailSender } from '../../../application/mails/GMailSender';
import { AuthServiceError } from '../types/errors';

export class AuthResendConfirmationCodeCommand {
  constructor(public readonly dto: AuthResendingEmailDto) {}
}

@CommandHandler(AuthResendConfirmationCodeCommand)
export class AuthResendConfirmationCodeCase implements ICommandHandler<AuthResendConfirmationCodeCommand> {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly usersService: UsersService,
    private readonly mailSender: GMailSender,
  ) {}

  async execute({ dto }: AuthResendConfirmationCodeCommand): Promise<ServiceResult> {
    await validateOrRejectDto(dto, AuthResendingEmailDto);

    const result = new ServiceResult();

    const user: UserDocumentType | null = await this.usersRepo.getUserByEmail(dto.email);

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

    await this.usersRepo.saveDoc(user);

    await this.mailSender.sendRegistrationMail(user.email, user.authConfirmation.code).catch((e) => console.log(e));

    return result;
  }
}
