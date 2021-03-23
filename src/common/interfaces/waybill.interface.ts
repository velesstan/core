import { Document } from 'mongoose';

import { WaybillAction, WaybillType } from 'src/common/enums';

import {
  TransactionModel,
  TransactionPopulated,
} from './transaction.interface';

interface Item {
  readonly product: string;
  readonly quantity: number;
}
interface BaseWaybill {
  readonly products: Array<Item>;
}

export interface Waybill extends BaseWaybill {
  readonly user: string;
  readonly source?: string;
  readonly destination?: string;
  readonly action: WaybillAction;
  readonly type: WaybillType;
  readonly date?: Date;
}
export interface WaybillModel extends Waybill, Document {
  readonly createdAt: Date;
  readonly date: Date;
  readonly transactions: TransactionModel[];
  readonly serialNumber: number;
}
export interface WaybillPopulated extends Omit<WaybillModel, 'transactions'> {
  readonly transactions: TransactionPopulated[];
}
export interface WaybillCounterModel extends Document {
  readonly serialNumber: number;
}

type Sell = {
  action: WaybillAction.SELL;
  type: WaybillType.OUTCOME;
  source: string;
} & BaseWaybill;
type Utilize = {
  action: WaybillAction.UTILIZATION;
  type: WaybillType.OUTCOME;
  source: string;
} & BaseWaybill;
type Buy = {
  action: WaybillAction.BUY;
  type: WaybillType.INCOME;
  destination: string;
} & BaseWaybill;
type Import = {
  action: WaybillAction.IMPORT;
  type: WaybillType.INCOME;
  destination: string;
} & BaseWaybill;
type Move = {
  action: WaybillAction.MOVE;
  type: WaybillType.INCOME | WaybillType.OUTCOME;
  source: string;
  destination: string;
} & BaseWaybill;
type Production = {
  action: WaybillAction.PRODUCTION;
  type: WaybillType.INCOME | WaybillType.OUTCOME;
  source: string;
  destination: string;
} & BaseWaybill;

export type TWaybill = Sell | Utilize | Buy | Import | Move | Production;
