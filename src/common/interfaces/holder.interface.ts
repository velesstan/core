import { Document } from 'mongoose';

import { HolderType } from '../enums';

export interface Holder {
  readonly type: HolderType;
  readonly title: string;
}

export interface HolderModel extends Holder, Document {}
