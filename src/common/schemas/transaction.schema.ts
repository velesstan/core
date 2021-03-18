import { Schema } from 'mongoose';

import { ProductRef } from './product.schema';
import { HolderRef } from './holder.schema';

export const TransactionRef = 'TransactionRef';
export const TransactionSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: ProductRef,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    validate: {
      validator: (value: number) => value !== 0,
    },
  },
  holder: {
    type: Schema.Types.ObjectId,
    ref: HolderRef,
    required: true,
  },
  createdAt: {
    type: Date,
    default: () => new Date(),
  },
  snapshot: {
    type: {
      price: {
        type: Number,
        required: true,
      },
      reduce: {
        type: Boolean,
        required: true,
      },
    },
  },
});
