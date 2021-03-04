import { Body, Controller, Post } from '@nestjs/common';

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
}
