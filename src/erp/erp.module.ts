import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import {
  CategoryRef,
  CategorySchema,
  ProductRef,
  ProductSchema,
  TransactionRef,
  TransactionSchema,
  WaybillCounterRef,
  WaybillCounterSchema,
  WaybillRef,
  WaybillSchema,
} from 'src/common/schemas';

import { CategoryController } from './category.controller';
import { CategoryService } from './category.service';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { TransactionService } from './transaction.service';
import { WaybillController } from './waybill.controller';
import { WaybillService } from './waybill.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CategoryRef, schema: CategorySchema },
      { name: ProductRef, schema: ProductSchema },
      { name: WaybillRef, schema: WaybillSchema },
      { name: WaybillCounterRef, schema: WaybillCounterSchema },
      { name: TransactionRef, schema: TransactionSchema },
    ]),
  ],
  controllers: [CategoryController, ProductController, WaybillController],
  providers: [
    CategoryService,
    ProductService,
    WaybillService,
    TransactionService,
  ],
})
export class ERPModule {}
