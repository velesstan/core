import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import {
  WaybillModel,
  WaybillCounterModel,
  TransactionModel,
  TWaybill,
} from 'src/common/interfaces';
import { WaybillCounterRef, WaybillRef } from 'src/common/schemas';
import { WaybillAction } from 'src/common/enums';

import { FindWaybillDto } from './dto/waybill';
import { ProductService } from './product.service';
import { TransactionService } from './transaction.service';

@Injectable()
export class WaybillService {
  constructor(
    @InjectModel(WaybillRef) private readonly waybillModel: Model<WaybillModel>,
    @InjectModel(WaybillCounterRef)
    private readonly waybillCounterModel: Model<WaybillCounterModel>,
    private readonly transactionService: TransactionService,
    private readonly productService: ProductService,
  ) {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    const waybillCounter = await this.waybillCounterModel.find({}).exec();
    if (waybillCounter.length === 1) {
      return;
    }
    if (waybillCounter.length === 0) {
      await new this.waybillCounterModel({ serialNumber: 0 }).save();
    } else {
      throw 'Error waybill serial number!';
    }
  }

  async findById(id: string): Promise<WaybillModel | null> {
    return await this.waybillModel
      .findById(id)
      .populate([
        {
          path: 'transactions',
          populate: [
            {
              path: 'product',
              populate: 'category',
            },
          ],
        },
        {
          path: 'stock',
        },
      ])
      .exec();
  }

  async find(query: FindWaybillDto): Promise<WaybillModel[]> {
    const { startDate, endDate, holder, ...rest } = query;
    return await this.waybillModel
      .find({
        ...rest,
        ...(holder
          ? { $or: [{ source: holder }, { destination: holder }] }
          : {}),
        ...(endDate
          ? {
              createdAt: {
                $gte: startDate,
                $lte: endDate,
              },
            }
          : {}),
      })
      .sort('-createdAt')
      .limit(10)
      .populate([
        {
          path: 'transactions',
          populate: [
            {
              path: 'product',
              populate: 'category',
            },
          ],
        },
        {
          path: 'source',
        },
        {
          path: 'destination',
        },
        {
          path: 'user',
        },
      ])
      .exec();
  }

  async nextWaybillSerialNumber(): Promise<number> {
    const counter = await this.waybillCounterModel
      .findOneAndUpdate(
        {},
        {
          $inc: {
            serialNumber: 1,
          },
        },
        { new: true },
      )
      .exec();
    if (!counter) {
      throw new HttpException(
        'Невозможно создать следующий номер накладной',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return counter.toObject().serialNumber;
  }

  async create(waybill: TWaybill, user: string): Promise<WaybillModel> {
    const serialNumber = await this.nextWaybillSerialNumber();
    switch (waybill.action) {
      case WaybillAction.BUY:
      case WaybillAction.IMPORT: {
        const { action, type, products, destination } = waybill;
        const transactions = await Promise.all(
          products.map(({ product, quantity }) =>
            this.transactionService.create({
              action,
              type,
              product,
              quantity,
              holder: destination,
            }),
          ),
        );
        const $waybill = await new this.waybillModel({
          action,
          type,
          destination,
          transactions,
          serialNumber,
          user,
        }).save();
        return $waybill;
      }
      case WaybillAction.SELL:
      case WaybillAction.UTILIZATION: {
        const { action, type, products, source } = waybill;
        const transactions = await Promise.all(
          products.map(({ product, quantity }) =>
            this.transactionService.create({
              action,
              type,
              product,
              quantity: -quantity,
              holder: source,
            }),
          ),
        );
        const $waybill = await new this.waybillModel({
          action,
          type,
          source,
          transactions,
          serialNumber,
          user,
        }).save();
        return $waybill;
      }
      case WaybillAction.MOVE: {
        const { action, type, products, source, destination } = waybill;
        const outcomeTransactions = await Promise.all(
          products.map(({ product, quantity }) =>
            this.transactionService.create({
              action,
              type,
              product,
              quantity: -quantity,
              holder: source,
            }),
          ),
        );
        const incomeTransactions = await Promise.all(
          products.map(({ product, quantity }) =>
            this.transactionService.create({
              action,
              type,
              product,
              quantity,
              holder: destination,
            }),
          ),
        );
        const $waybill = await new this.waybillModel({
          action,
          type,
          source,
          destination,
          transactions: [...incomeTransactions, ...outcomeTransactions],
          serialNumber,
          user,
        }).save();
        return $waybill;
      }
      case WaybillAction.PRODUCTION: {
        const { action, type, products, source, destination } = waybill;
        const populatedProducts = await Promise.all(
          products.map(async (p) => {
            const product = await this.productService.getById(p.product);
            if (!product)
              throw new HttpException('', HttpStatus.INTERNAL_SERVER_ERROR);
            return {
              productId: product._id,
              requires: product.requires,
              quantity: p.quantity,
            };
          }),
        );
        const outcomeTransactions: TransactionModel[] = [];
        for (let i = 0; i < populatedProducts.length; i++) {
          for (let j = 0; j < populatedProducts[i].requires.length; j++) {
            const transaction = await this.transactionService.create({
              action,
              type,
              product: populatedProducts[i].requires[j].product,
              quantity:
                -populatedProducts[i].requires[j].quantity *
                populatedProducts[i].quantity,
              holder: source,
            });
            outcomeTransactions.push(transaction);
          }
        }
        const incomeTransactions = await Promise.all(
          products.map((p) =>
            this.transactionService.create({
              action,
              type,
              product: p.product,
              quantity: p.quantity,
              holder: destination,
            }),
          ),
        );
        const $waybill = await new this.waybillModel({
          action,
          type,
          source,
          destination,
          transactions: [...incomeTransactions, ...outcomeTransactions],
          serialNumber,
          user,
        }).save();
        return $waybill;
      }
    }
  }

  async deleteWaybill(waybillId: string): Promise<void> {
    const waybill = await this.waybillModel.findByIdAndRemove(waybillId).exec();
    if (waybill) {
      await Promise.all(
        waybill.transactions.map((t) => this.transactionService.delete(t._id)),
      );
    }
  }
}
