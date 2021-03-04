import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserRef, UserSchema } from 'src/common/schemas';
import { UserService } from './user.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserRef, schema: UserSchema }])],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
