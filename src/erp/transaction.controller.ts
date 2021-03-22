import { Controller, Get } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { TransactionModel } from 'src/common/interfaces';
import { TransactionRef } from 'src/common/schemas';

@Controller('transactions')
export class TransactionController {
  constructor(
    @InjectModel(TransactionRef)
    private readonly transactionModel: Model<TransactionModel>,
  ) {}
}
