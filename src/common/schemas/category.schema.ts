import { Schema } from 'mongoose';

export const CategoryRef = 'CategoryRef';
export const CategorySchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      unique: true,
    },
    sortPriority: {
      type: Number,
      default: 1000,
    },
  },
  {
    timestamps: true,
  },
);
