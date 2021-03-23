import {
  Body,
  Controller,
  Post,
  Headers,
  UnauthorizedException,
} from '@nestjs/common';
import decode from 'jwt-decode';

import { AuthService } from './auth.service';
import { SignInDto } from './dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/sign-in')
  async signIn(
    @Body() credentials: SignInDto,
  ): Promise<{ accessToken: string }> {
    return await this.authService.signIn(credentials);
  }

  @Post('/refreshSession')
  async refreshSession(
    @Headers('authorization') authorization: string,
    @Body('refreshToken') refreshToken: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    try {
      const payload = decode<any>(authorization.split(' ')[1]);
      return await this.authService.refreshSession(payload._id, refreshToken);
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
