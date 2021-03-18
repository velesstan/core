import { Schema } from 'mongoose';

export const UserRef = 'UserRef';
export const UserSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
    },
    firstName: String,
    lastName: String,
    refreshToken: String,
    refreshTokenExpires: Date,
  },
  { timestamps: true },
);
