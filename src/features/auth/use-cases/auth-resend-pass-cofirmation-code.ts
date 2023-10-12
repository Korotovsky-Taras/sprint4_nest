import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { UsersService } from '../../users/domain/users.service';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';
import { UserDocumentType } from '../../users/types/dao';
import { UsersRepository } from '../../users/dao/users.repository';
import { GMailSender } from '../../../application/mails/GMailSender';
import { AuthServiceError } from '../types/errors';
import { AuthPasswordRecoveryDto } from '../dto/AuthPasswordRecoveryDto';

export class AuthResendPassConfirmationCodeCommand {
  constructor(public readonly dto: AuthPasswordRecoveryDto) {}
}

@CommandHandler(AuthResendPassConfirmationCodeCommand)
export class AuthResendPassConfirmationCodeCase implements ICommandHandler<AuthResendPassConfirmationCodeCommand> {
  constructor(
    private readonly usersRepo: UsersRepository,
    private readonly usersService: UsersService,
    private readonly mailSender: GMailSender,
  ) {}

  async execute({ dto }: AuthResendPassConfirmationCodeCommand): Promise<ServiceResult> {
    await validateOrRejectDto(dto, AuthPasswordRecoveryDto);

    const result = new ServiceResult();

    const user: UserDocumentType | null = await this.usersRepo.getUserByEmail(dto.email);

    if (!user) {
      result.addError({
        code: AuthServiceError.AUTH_USER_NO_FOUND,
      });
      return result;
    }
    if (user.isPassConfirmed()) {
      result.addError({
        code: AuthServiceError.AUTH_CODE_ALREADY_CONFIRMED,
      });
      return result;
    }

    user.setPassConfirmation(this.usersService.createUserConfirmation());

    await this.usersRepo.saveDoc(user);

    await this.mailSender.sendPasswordRecoveryMail(user.email, user.passConfirmation.code).catch((e) => console.log(e));

    return result;
  }
}
