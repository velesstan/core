import { Document } from 'mongoose';

export interface Product {
  readonly code: string;
  readonly title: string;
  readonly category: string;
  readonly unit: string;
  readonly price_retail: number;
  readonly price_wholesale: number;
  readonly requires: Array<{ product: string; quantity: number }>;
}

export interface ProductModel extends Product, Document {}
