import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Role } from 'src/common/enums';
import { User, UserModel } from 'src/common/interfaces';
import { UserRef } from 'src/common/schemas';

import { CreateUserDto, FindUsersDto, UpdateUserDto } from './dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserRef) private readonly userModel: Model<UserModel>,
  ) {
    if (process.env.NODE_ENV !== 'testing') {
      this.boot();
    }
  }

  private async boot() {
    const admin = await this.findByUsername('admin@veles.services');
    if (!admin) {
      await new this.userModel({
        role: Role.Admin,
        username: 'admin@veles.services',
        password: 'admin',
      }).save();
    }
  }

  async find(query: FindUsersDto): Promise<User[]> {
    const { _id, username } = query;
    return await this.userModel
      .find({
        ...(_id ? { _id } : {}),
        ...(username ? { username } : {}),
      })
      .exec();
  }

  async create(user: CreateUserDto): Promise<User> {
    return await new this.userModel(user).save();
  }

  async update(userId: string, user: UpdateUserDto): Promise<User | null> {
    return await this.userModel
      .findByIdAndUpdate(userId, user, { new: true })
      .exec();
  }

  async remove(userId: string): Promise<void> {
    await this.userModel.remove({ _id: userId }).exec();
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
