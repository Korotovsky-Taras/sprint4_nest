import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Injectable, NotFoundException, Param, Post, Query, UseGuards } from '@nestjs/common';
import { IUsersController } from '../types/common';
import { UserServiceError, UsersService } from '../domain/users.service';
import { UsersQueryRepository } from '../dao/users.query.repository';
import { UsersDataMapper } from './users.dm';
import { UserListViewDto, UserPaginationQueryDto, UserViewModel } from '../types/dto';
import { Status } from '../../../application/utils/types';
import { ServiceResult } from '../../../application/core/ServiceResult';
import { AuthBasicGuard } from '../../../application/guards/AuthBasicGuard';
import { AuthUserCreateDto } from '../../auth/dto/AuthUserCreateDto';

@Injectable()
@Controller('users')
export class UsersController implements IUsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly usersQueryRepo: UsersQueryRepository,
  ) {}

  @Get()
  @HttpCode(Status.OK)
  async getAll(@Query() query: UserPaginationQueryDto): Promise<UserListViewDto> {
    return await this.usersQueryRepo.getUsers(UsersDataMapper.toRepoQuery(query), UsersDataMapper.toUsersView);
  }

  @Post()
  @UseGuards(AuthBasicGuard)
  @HttpCode(Status.CREATED)
  async createUser(@Body() input: AuthUserCreateDto): Promise<UserViewModel> {
    const result: ServiceResult<UserViewModel> = await this.usersService.createConfirmedUser(input);
    if (result.hasErrorCode(UserServiceError.USER_ALREADY_REGISTER)) {
      throw new BadRequestException();
    }
    return result.getData();
  }

  @Delete(':id')
  @UseGuards(AuthBasicGuard)
  @HttpCode(Status.NO_CONTENT)
  async deleteUser(@Param('id') userId: string) {
    const userExist: boolean = await this.usersQueryRepo.isUserExist(userId);

    if (!userExist) {
      throw new NotFoundException();
    }

    await this.usersService.deleteUser(userId);
  }
}
