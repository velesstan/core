import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { UserRef, UserSchema } from 'src/common/schemas';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserRef, schema: UserSchema }])],
})
export class UserModule {}
