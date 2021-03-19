import { Document } from 'mongoose';

import { WaybillAction, WaybillType } from 'src/common/enums';
import { HolderModel } from './holder.interface';
import { ProductModel } from './product.interface';

interface ProductSnapshot {
  readonly price: number;
  readonly reduce: boolean;
}

export interface Transaction {
  readonly action: WaybillAction;
  readonly type: WaybillType;
  readonly holder: string;
  readonly product: string;
  readonly quantity: number;
}
export interface TransactionModel extends Transaction, Document {
  readonly createdAt: Date;
  readonly snapshot: ProductSnapshot;
}

export interface TransactionPopulated
  extends Omit<TransactionModel, 'holder' | 'product'> {
  readonly holder: HolderModel;
  readonly product: ProductModel;
}
