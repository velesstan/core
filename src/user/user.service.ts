import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserModel } from 'src/common/interfaces';
import { UserRef } from 'src/common/schemas';
import { FindUsersDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserRef) private readonly userModel: Model<UserModel>,
  ) {
    this.boot();
  }

  private async boot() {
    if (process.env.NODE_ENV !== 'testing') {
      const admin = await this.findByUsername('admin@veles.services');
      if (!admin) {
        await new this.userModel({
          username: 'admin@veles.services',
          password: 'admin',
        }).save();
      }
    }
  }

  async find(query: FindUsersDto): Promise<UserModel[]> {
    return await this.userModel.find(query).exec();
  }

  async findById(id: string): Promise<UserModel | null> {
    return await this.userModel.findById(id).exec();
  }

  async findByUsername(username: string): Promise<UserModel | null> {
    return await this.userModel.findOne({ username }).exec();
  }

  async setRefreshToken(
    userId: string,
    refreshToken: string,
    refreshTokenExpires: Date,
  ): Promise<void> {
    await this.userModel
      .findByIdAndUpdate(userId, {
        $set: {
          refreshToken,
          refreshTokenExpires,
        },
      })
      .exec();
  }
}
