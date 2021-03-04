import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Roles } from 'src/common/decorators';
import { Role } from 'src/common/enums';

import { JwtAuthGuard, RolesGuard } from 'src/common/guards';
import { User } from 'src/common/interfaces';

import { CreateUserDto, FindUsersDto } from './dto';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(RolesGuard)
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  @Roles([Role.Admin, Role.User])
  async find(@Query() query: FindUsersDto): Promise<User[]> {
    return await this.userService.find(query);
  }

  @Post('/')
  async create(@Body() user: CreateUserDto): Promise<User> {
    return await this.userService.create(user);
  }
}
