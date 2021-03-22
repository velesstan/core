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

import { WaybillAction } from 'src/common/enums';
import { FindBalancesDto } from './dto/balances';

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

  async countBalances(query: FindBalancesDto) {
    const { stock, startDate, endDate, code, category } = query;
    const aggregated = await this.transactionModel.aggregate([
      {
        $match: {
          ...(stock ? { stock: new ObjectId(stock) } : {}),
          ...(endDate
            ? {
                createdAt: {
                  $lte: endDate,
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
              $cond: [{ $lte: ['$createdAt', startDate] }, '$quantity', 0],
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
                    ...(startDate ? [{ $gte: ['$createdAt', startDate] }] : []),
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
                    ...(startDate ? [{ $gte: ['$createdAt', startDate] }] : []),
                    { $gte: ['$createdAt', startDate] },
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
