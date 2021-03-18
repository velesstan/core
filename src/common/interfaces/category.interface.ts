import { Document } from 'mongoose';

export interface Category {
  readonly title: string;
  readonly sortPriority?: number;
}

export interface CategoryModel extends Category, Document {}
