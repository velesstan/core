import { Controller, Get, Query, UseGuards } from '@nestjs/common';

import { JwtAuthGuard } from 'src/common/guards';
import { UserModel } from 'src/common/interfaces';

import { FindUsersDto } from './dto';
import { UserService } from './user.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  async find(@Query() query: FindUsersDto): Promise<UserModel[]> {
    return await this.userService.find(query);
  }
}
