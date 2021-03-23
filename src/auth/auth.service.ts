import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import randtoken from 'rand-token';
import dayjs from 'dayjs';

import { UserService } from 'src/user/user.service';
import { SignInDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
  ) {}

  async signIn(
    credentials: SignInDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userService.findByUsername(credentials.username);
    if (user && user.password === credentials.password) {
      const {
        password,
        refreshToken,
        refreshTokenExpires,
        ...payload
      } = user.toObject();
      return {
        accessToken: this.jwtService.sign(payload),
        refreshToken: await this.generateRefreshToken(user._id),
      };
    }
    throw new UnauthorizedException();
  }

  async refreshSession(
    userId: string,
    token: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const user = await this.userService.findById(userId);
    if (user) {
      if (user.toObject().refreshToken !== token) {
        throw new UnauthorizedException();
      }
      if (dayjs().diff(dayjs(user.refreshTokenExpires), 'seconds') > 10) {
        throw new UnauthorizedException();
      }
      const {
        password,
        refreshToken,
        refreshTokenExpires,
        ...payload
      } = user.toObject();
      return {
        accessToken: this.jwtService.sign(payload),
        refreshToken: await this.generateRefreshToken(userId),
      };
    } else {
      throw new UnauthorizedException();
    }
  }

  async generateRefreshToken(userId: string): Promise<string> {
    const refreshToken = randtoken.generate(24);
    const expiryDate = dayjs().add(10, 'days');
    await this.userService.setRefreshToken(
      userId,
      refreshToken,
      expiryDate.toDate(),
    );
    return refreshToken;
  }
}
