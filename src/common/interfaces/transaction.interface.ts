import { Document } from 'mongoose';

import { WaybillAction, WaybillType } from 'src/common/enums';

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
  // ToDo make populated
  readonly createdAt: Date;
  readonly snapshot: ProductSnapshot;
}
