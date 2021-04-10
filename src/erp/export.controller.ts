import { Controller, Get, Header, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { Readable } from 'stream';
import { createBalancesXlsxBook } from '@velesstan/utils';

import { DocumentService } from 'src/document';

import { CategoryService } from './category.service';
import { ProductService } from './product.service';
import { TransactionService } from './transaction.service';

import { FindBalancesDto } from './dto/balances';

@Controller('/export')
export class ExportController {
  constructor(
    private readonly documentService: DocumentService,
    private readonly transactionService: TransactionService,
    private readonly categoryService: CategoryService,
    private readonly productService: ProductService,
  ) {}

  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment;')
  @Get('/balances')
  async exportBalances(
    @Query() query: FindBalancesDto,
    @Res() response: Response,
  ) {
    const balances = await this.transactionService.countBalances(query);
    const buffer = createBalancesXlsxBook(balances);
    try {
      Readable.from(buffer).pipe(response);
    } catch (e) {
      console.error(e);
    }
  }

  @Header(
    'Content-Type',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  )
  @Header('Content-Disposition', 'attachment;')
  @Get('/products')
  async exportProducts(@Res() response: Response) {
    const categories = await this.categoryService.find();
    const data: any = {};
    for (let i = 0; i < categories.length; i++) {
      data[i] = {
        category: categories[i].title,
        products: await this.productService.find({
          category: categories[i]._id,
        }),
      };
    }
    const buffer = await this.documentService.createProductsXlsxBook(data);
    try {
      Readable.from(buffer).pipe(response);
    } catch (e) {
      console.error(e);
    }
  }
}
