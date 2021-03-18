import { Schema } from 'mongoose';

import { UserRef, HolderRef, TransactionRef } from 'src/common/schemas';

export const WaybillRef = 'WaybillRef';
export const WaybillSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: UserRef,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    required: true,
  },
  source: {
    type: Schema.Types.ObjectId,
    ref: HolderRef,
    required: false,
  },
  destination: {
    type: Schema.Types.ObjectId,
    ref: HolderRef,
    required: false,
  },
  serialNumber: {
    type: Number,
    required: true,
  },
  transactions: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: TransactionRef,
      },
    ],
    required: true,
    validate: (v: []) => Array.isArray(v) && !!v.length,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

export const WaybillCounterRef = 'WaybillCounterRef';
export const WaybillCounterSchema = new Schema(
  {
    serialNumber: {
      type: Number,
      default: 0,
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  },
);
