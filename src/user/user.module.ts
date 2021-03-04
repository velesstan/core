import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserRef, UserSchema } from 'src/common/schemas';
import { UserService } from './user.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserRef, schema: UserSchema }])],
  providers: [UserService],
})
export class UserModule {}
