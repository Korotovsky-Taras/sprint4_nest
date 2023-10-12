import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { UsersService } from '../../users/domain/users.service';
import { UserViewModel } from '../../users/types/dto';
import { AuthRegistrationDto } from '../dto/AuthRegistrationDto';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';

export class AuthCreateUserWithConfirmationCommand {
  constructor(public readonly dto: AuthRegistrationDto) {}
}

@CommandHandler(AuthCreateUserWithConfirmationCommand)
export class AuthCreateUserWithCodeCase implements ICommandHandler<AuthCreateUserWithConfirmationCommand> {
  constructor(private readonly userService: UsersService) {}

  async execute({ dto }: AuthCreateUserWithConfirmationCommand): Promise<ServiceResult<UserViewModel>> {
    await validateOrRejectDto(dto, AuthRegistrationDto);
    return this.userService.createUser(dto, false);
  }
}
