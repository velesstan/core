import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  CategoryRef,
  CategorySchema,
  HolderRef,
  HolderSchema,
  ProductRef,
  ProductSchema,
  TransactionRef,
  TransactionSchema,
  WaybillCounterRef,
  WaybillCounterSchema,
  WaybillRef,
  WaybillSchema,
} from 'src/common/schemas';
import { DocumentModule, DocumentService } from 'src/document';
import { BalancesController } from './balances.controller';
import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { HolderController } from './holder.controller';
import { HolderService } from './holder.service';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { TransactionController } from './transaction.controller';
import { TransactionService } from './transaction.service';
import { WaybillController } from './waybill.controller';
import { WaybillService } from './waybill.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CategoryRef, schema: CategorySchema },
      { name: ProductRef, schema: ProductSchema },
      { name: HolderRef, schema: HolderSchema },
      { name: WaybillRef, schema: WaybillSchema },
      { name: WaybillCounterRef, schema: WaybillCounterSchema },
      { name: TransactionRef, schema: TransactionSchema },
    ]),
    DocumentModule,
  ],
  controllers: [
    CategoryController,
    ProductController,
    HolderController,
    WaybillController,
    TransactionController,
    BalancesController,
  ],
  providers: [
    CategoryService,
    ProductService,
    HolderService,
    WaybillService,
    TransactionService,
    DocumentService,
  ],
})
export class ERPModule {}
