import { Schema } from 'mongoose';

import { HolderType } from 'src/common/enums';

export const HolderRef = 'HolderRef';
export const HolderSchema = new Schema(
  {
    type: {
      type: String,
      enum: HolderType,
      default: HolderType.Stock,
    },
    title: {
      type: String,
      unique: true,
      required: true,
    },
  },
  {
    timestamps: true,
  },
);
