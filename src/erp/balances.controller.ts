import { Controller, Get, Query } from '@nestjs/common';

import { TransactionBalance } from 'src/common/interfaces';

import { FindBalancesDto } from './dto/balances';
import { TransactionService } from './transaction.service';

@Controller('balances')
export class BalancesController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('/')
  async countBalances(
    @Query() query: FindBalancesDto,
  ): Promise<TransactionBalance[]> {
    return await this.transactionService.countBalances(query);
  }
}
