import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { UserModel } from 'src/common/interfaces';
import { UserRef } from 'src/common/schemas';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserRef) private readonly userModel: Model<UserModel>,
  ) {
    this.boot();
  }

  private async boot() {
    console.log('Booting...');
    console.log('Process ENV: ', process.env.NODE_ENV);
  }
}
