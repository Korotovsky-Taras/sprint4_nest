import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { AuthUserCreateDto } from '../../auth/dto/AuthUserCreateDto';
import { UsersService } from '../domain/users.service';
import { UserViewModel } from '../types/dto';
import { validateOrRejectDto } from '../../../application/utils/validateOrRejectDto';

export class CreateConfirmedUserCommand {
  constructor(public readonly dto: AuthUserCreateDto) {}
}

@CommandHandler(CreateConfirmedUserCommand)
export class CreateConfirmedUserCase implements ICommandHandler<CreateConfirmedUserCommand> {
  constructor(private readonly userService: UsersService) {}

  async execute({ dto }: CreateConfirmedUserCommand): Promise<ServiceResult<UserViewModel>> {
    await validateOrRejectDto(dto, AuthUserCreateDto);
    return this.userService.createUser(dto, true);
  }
}
