import { Controller, Get, Query } from '@nestjs/common';

import { FindBalancesDto } from './dto/balances';
import { TransactionService } from './transaction.service';

@Controller('balances')
export class BalancesController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('/')
  async countBalances(@Query() query: FindBalancesDto): Promise<any> {
    return await this.transactionService.countBalances(query);
  }
}
