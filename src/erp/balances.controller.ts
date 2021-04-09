import { Controller, Get, Query } from '@nestjs/common';
import { ProductBalance } from '@velesstan/interfaces';

import { FindBalancesDto } from './dto/balances';
import { TransactionService } from './transaction.service';

@Controller('balances')
export class BalancesController {
  constructor(private readonly transactionService: TransactionService) {}

  @Get('/')
  async countBalances(
    @Query() query: FindBalancesDto,
  ): Promise<ProductBalance[]> {
    return await this.transactionService.countBalances(query);
  }
}
