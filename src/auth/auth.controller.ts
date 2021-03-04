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

  @Post('/refreshToken')
  async refreshToken(
    @Headers('authorization') authorization: string,
  ): Promise<{ accessToken: string }> {
    try {
      const payload = decode<any>(authorization.split(' ')[1]);
      const { _id, refreshToken } = payload;
      return await this.authService.refreshToken(_id, refreshToken);
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
