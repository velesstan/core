import { Document } from 'mongoose';

export interface ProductModel extends Document {
  code: string;
  title: string;
  unit: string;
  price_retail: number;
  price_wholesale: number;
  category: string;
  requires: ReadonlyArray<{ product: string; quantity: number }>;
}
