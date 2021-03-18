import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';

import {
  ProductModel,
  Transaction,
  TransactionModel,
} from 'src/common/interfaces';
import { ProductRef, TransactionRef } from 'src/common/schemas';

import { FindTransactionsDto } from './dto/transaction';
import { WaybillAction } from 'src/common/enums';

@Injectable()
export class TransactionService {
  constructor(
    @InjectModel(TransactionRef)
    private readonly transactionModel: Model<TransactionModel>,
    @InjectModel(ProductRef) private readonly productModel: Model<ProductModel>,
  ) {}

  async create(
    transaction: Transaction,
    reduce: boolean = false,
  ): Promise<TransactionModel> {
    const { action, type, product, quantity, holder } = transaction;

    const populatedProduct = await this.productModel.findById(product);

    if (!populatedProduct) {
      throw new HttpException('', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    let price: number;

    if (action === WaybillAction.SELL && reduce === true)
      price = populatedProduct.toObject().price_wholesale;
    else price = populatedProduct.toObject().price_retail;

    return await new this.transactionModel({
      ...transaction,
      snapshot: {
        reduce,
        price,
      },
    }).save();
  }

  async delete(transactionId: string): Promise<void> {
    await this.transactionModel.findByIdAndDelete(transactionId).exec();
  }

  async count(query: FindTransactionsDto) {
    const { stock, start, end, code, category } = query;
    const aggregated = await this.transactionModel.aggregate([
      {
        $match: {
          active: true,
          ...(stock ? { stock: new ObjectId(stock) } : {}),
          ...(end
            ? {
                createdAt: {
                  $lte: end,
                },
              }
            : {}),
        },
      },
      {
        $group: {
          _id: '$product',
          startBalance: {
            $sum: {
              $cond: [{ $lte: ['$createdAt', start] }, '$quantity', 0],
            },
          },
          endBalance: {
            $sum: '$quantity',
          },
          totalIncome: {
            $sum: {
              $cond: [
                {
                  $and: [
                    ...(start ? [{ $gte: ['$createdAt', start] }] : []),
                    { $gt: ['$quantity', 0] },
                  ],
                },
                '$quantity',
                0,
              ],
            },
          },
          totalOutcome: {
            $sum: {
              $cond: [
                {
                  $and: [
                    ...(start ? [{ $gte: ['$createdAt', start] }] : []),
                    { $gte: ['$createdAt', start] },
                    { $lt: ['$quantity', 0] },
                  ],
                },
                '$quantity',
                0,
              ],
            },
          },
        },
      },
      {
        $lookup: {
          from: 'productrefs',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      {
        $unwind: '$product',
      },
      {
        $match: {
          ...(code ? { 'product.code': new RegExp(code.trim(), 'ig') } : {}),
          ...(category ? { 'product.category': new ObjectId(category) } : {}),
        },
      },
      {
        $lookup: {
          from: 'categoryrefs',
          localField: 'product.category',
          foreignField: '_id',
          as: 'category',
        },
      },
      {
        $unwind: '$category',
      },
      {
        $sort: { 'category.sortPriority': 1, 'product.code': 1 },
      },
    ]);
    return aggregated;
  }
}
