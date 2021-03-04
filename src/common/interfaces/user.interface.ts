import { Document } from 'mongoose';

import { Role } from 'src/common/enums';

export interface User {
  readonly role: Role;
  readonly username: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
}

export interface UserModel extends User, Document {
  readonly refreshToken: string;
  readonly refreshTokenExpires: Date;
}
