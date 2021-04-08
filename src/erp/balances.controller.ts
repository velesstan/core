import { Controller, Get, Header, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { Readable } from 'stream';

import { TransactionBalance } from 'src/common/interfaces';

import { FindBalancesDto } from './dto/balances';
import { TransactionService } from './transaction.service';
import { DocumentService } from 'src/document';

@Controller('balances')
export class BalancesController {
  constructor(
    private readonly transactionService: TransactionService,
    private readonly documentService: DocumentService,
  ) {}

  @Get('/')
  async countBalances(
    @Query() query: FindBalancesDto,
  ): Promise<TransactionBalance[]> {
    const balances = await this.transactionService.countBalances(query);
    await this.documentService.createBalancesXlsxBook(balances);
    return balances;
  }

  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment;')
  @Get('/export')
  async exportBalances(
    @Query() query: FindBalancesDto,
    @Res() response: Response,
  ) {
    const balances = await this.transactionService.countBalances(query);
    const buffer = await this.documentService.createBalancesXlsxBook(balances);
    try {
      Readable.from(buffer).pipe(response);
    } catch (e) {
      console.error(e);
    }
  }
}
