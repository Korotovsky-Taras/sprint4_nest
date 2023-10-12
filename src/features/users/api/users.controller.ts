import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Injectable, NotFoundException, Param, Post, Query, UseGuards } from '@nestjs/common';
import { IUsersController } from '../types/common';
import { UsersService } from '../domain/users.service';
import { UsersQueryRepository } from '../dao/users.query.repository';
import { UsersDataMapper } from './users.dm';
import { UserListViewModel, UserPaginationQueryModel, UserViewModel } from '../types/dto';
import { Status } from '../../../application/utils/types';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { AuthBasicGuard } from '../../../application/guards/AuthBasicGuard';
import { AuthUserCreateDto } from '../../auth/dto/AuthUserCreateDto';
import { CommandBus } from '@nestjs/cqrs';
import { DeleteUserCommand } from '../use-cases/delete-user.case';
import { UserServiceError } from '../types/errors';
import { CreateConfirmedUserCommand } from '../use-cases/create-confirmed-user.case';

@Injectable()
@Controller('users')
export class UsersController implements IUsersController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly usersService: UsersService,
    private readonly usersQueryRepo: UsersQueryRepository,
  ) {}

  @Get()
  @HttpCode(Status.OK)
  async getAll(@Query() query: UserPaginationQueryModel): Promise<UserListViewModel> {
    return await this.usersQueryRepo.getUsers(UsersDataMapper.toRepoQuery(query), UsersDataMapper.toUsersView);
  }

  @Post()
  @UseGuards(AuthBasicGuard)
  @HttpCode(Status.CREATED)
  async createUser(@Body() dto: AuthUserCreateDto): Promise<UserViewModel> {
    const result: ServiceResult<UserViewModel> = await this.commandBus.execute<CreateConfirmedUserCommand, ServiceResult<UserViewModel>>(
      new CreateConfirmedUserCommand(dto),
    );
    if (result.hasErrorCode(UserServiceError.USER_ALREADY_REGISTER)) {
      throw new BadRequestException();
    }
    return result.getData();
  }

  @Delete(':id')
  @UseGuards(AuthBasicGuard)
  @HttpCode(Status.NO_CONTENT)
  async deleteUser(@Param('id') userId: string) {
    const result = await this.commandBus.execute<DeleteUserCommand, ServiceResult>(new DeleteUserCommand(userId));
    if (result.hasErrorCode(UserServiceError.USER_NOT_FOUND)) {
      throw new NotFoundException();
    }
  }
}
