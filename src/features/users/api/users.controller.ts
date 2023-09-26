import { BadRequestException, Body, Controller, Delete, Get, HttpCode, Injectable, NotFoundException, Param, Post, Query } from '@nestjs/common';
import { IUsersController } from '../types/common';
import { UsersService } from '../domain/users.service';
import { UsersQueryRepository } from '../dao/users.query.repository';
import { UsersDataMapper } from './users.dm';
import { UserCreateRequestDto, UserListViewDto, UserPaginationQueryDto, UserViewDto } from '../types/dto';
import { Status } from '../../../utils/types';

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
  @HttpCode(Status.CREATED)
  async createUser(@Body() input: UserCreateRequestDto): Promise<UserViewDto> {
    const user: UserViewDto | null = await this.usersService.createUser(input);
    if (!user) {
      throw new BadRequestException();
    }
    return user;
  }

  @Delete(':id')
  @HttpCode(Status.NO_CONTENT)
  async deleteUser(@Param('id') userId: string) {
    const isDeleted: boolean = await this.usersService.deleteUser(userId);
    if (!isDeleted) {
      throw new NotFoundException();
    }
  }
}
