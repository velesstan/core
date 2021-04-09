import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ObjectId } from 'mongodb';
import { ProductBalance, ProductModel } from '@velesstan/interfaces';

import { Transaction, TransactionModel } from 'src/common/interfaces';
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
    reduce = false,
  ): Promise<TransactionModel> {
    const { product, discount } = transaction;

    const populatedProduct = await this.productModel.findById(product);

    if (!populatedProduct) {
      throw new HttpException('', HttpStatus.INTERNAL_SERVER_ERROR);
    }
    return await new this.transactionModel({
      ...transaction,
      price: discount
        ? populatedProduct.price_wholesale
        : populatedProduct.price_retail,
    }).save();
  }

  async delete(transactionId: string): Promise<void> {
    await this.transactionModel.findByIdAndDelete(transactionId).exec();
  }

  async countBalances(query: FindBalancesDto): Promise<ProductBalance[]> {
    const { holder, startDate, endDate, code, category } = query;
    const aggregated = await this.transactionModel.aggregate([
      {
        $match: {
          ...(holder ? { holder: new ObjectId(holder) } : {}),
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
          income: {
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
          outcome: {
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
        $project: {
          _id: '$product._id',
          category: '$category.title',
          code: '$product.code',
          title: '$product.title',
          unit: '$product.unit',
          startBalance: 1,
          endBalance: 1,
          income: 1,
          outcome: 1,
        },
      },
      {
        $sort: { 'category.sortPriority': 1, 'product.code': 1 },
      },
    ]);
    return aggregated as ProductBalance[];
  }
}
