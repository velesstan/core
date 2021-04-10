import { Controller, Get, Header, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { Readable } from 'stream';
import {
  createBalancesXlsxBook,
  createProductsXlsxBook,
} from '@velesstan/utils';

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
    const productData = await Promise.all(
      categories.map(async (category) => ({
        category,
        products: await this.productService.find({
          category: category._id,
        }),
      })),
    );
    const buffer = createProductsXlsxBook(productData);
    try {
      Readable.from(buffer).pipe(response);
    } catch (e) {
      console.error(e);
    }
  }
}
