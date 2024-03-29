import { Document } from 'mongoose';

import { WaybillAction, WaybillType } from 'src/common/enums';
import { HolderModel } from './holder.interface';
import { ProductModel } from './product.interface';

export interface Transaction {
  readonly action: WaybillAction;
  readonly type: WaybillType;
  readonly holder: string;
  readonly product: string;
  readonly discount: boolean;
  readonly quantity: number;
  readonly createdAt?: Date;
}
export interface TransactionModel extends Transaction, Document {
  readonly createdAt: Date;
  readonly price: number;
}

export interface TransactionPopulated
  extends Omit<TransactionModel, 'holder' | 'product'> {
  readonly holder: HolderModel;
  readonly product: ProductModel;
}
