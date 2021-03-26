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
import { WaybillAction, WaybillType } from 'src/common/enums';

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

  async findById(id: string): Promise<WaybillModel> {
    const $waybill = await this.waybillModel
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
    if ($waybill) return $waybill;
    else
      throw new HttpException('Resource doesnt exist', HttpStatus.BAD_REQUEST);
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

  async create(waybill: TWaybill): Promise<WaybillModel> {
    const { action, user } = waybill;
    const serialNumber = await this.nextWaybillSerialNumber();

    const transactions = await this.prepareTransactions(waybill);
    const type = this.prepareWaybillType(waybill);
    const holders = this.prepareWaybillHolders(waybill);
    const $waybill = await new this.waybillModel({
      type,
      action,
      transactions,
      serialNumber,
      user,
      ...holders,
    }).save();
    return $waybill;
  }

  async update(id: string, waybill: TWaybill): Promise<WaybillModel> {
    const { action, user, products, ...rest } = waybill;
    const $waybill = await this.waybillModel.findById(id);
    if ($waybill) {
      await Promise.all(
        $waybill.transactions.map(
          async (t) => await this.transactionService.delete(t._id),
        ),
      );
      const transactions = await this.prepareTransactions(waybill);
      const type = this.prepareWaybillType(waybill);
      const holders = this.prepareWaybillHolders(waybill);
      await $waybill
        .update({
          $set: {
            action,
            user,
            type,
            source: holders.source,
            destination: holders.destination,
            transactions: transactions.map((t) => t._id),
          },
        })
        .exec();
      return $waybill;
    } else
      throw new HttpException('Resource doesnt exist', HttpStatus.BAD_REQUEST);
  }

  async deleteWaybill(waybillId: string): Promise<void> {
    const waybill = await this.waybillModel.findByIdAndRemove(waybillId).exec();
    if (waybill) {
      await Promise.all(
        waybill.transactions.map((t) => this.transactionService.delete(t._id)),
      );
    }
  }

  async prepareTransactions(waybill: TWaybill): Promise<TransactionModel[]> {
    switch (waybill.action) {
      case WaybillAction.BUY:
      case WaybillAction.IMPORT: {
        const { action, products, destination } = waybill;
        const transactions = await Promise.all(
          products.map(({ product, quantity }) =>
            this.transactionService.create({
              type: WaybillType.INCOME,
              holder: destination,
              action,
              product,
              quantity,
            }),
          ),
        );
        return transactions;
      }
      case WaybillAction.SELL:
      case WaybillAction.UTILIZATION: {
        const { action, products, source } = waybill;
        const transactions = await Promise.all(
          products.map(({ product, quantity }) =>
            this.transactionService.create({
              type: WaybillType.OUTCOME,
              holder: source,
              quantity: -quantity,
              action,
              product,
            }),
          ),
        );
        return transactions;
      }
      case WaybillAction.MOVE: {
        const { action, products, source, destination } = waybill;
        const outcomeTransactions = await Promise.all(
          products.map(({ product, quantity }) =>
            this.transactionService.create({
              type: WaybillType.OUTCOME,
              holder: source,
              quantity: -quantity,
              action,
              product,
            }),
          ),
        );
        const incomeTransactions = await Promise.all(
          products.map(({ product, quantity }) =>
            this.transactionService.create({
              type: WaybillType.INCOME,
              holder: destination,
              action,
              product,
              quantity,
            }),
          ),
        );
        return [...incomeTransactions, ...outcomeTransactions];
      }
      case WaybillAction.PRODUCTION: {
        const { action, products, source, destination } = waybill;
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
              type: WaybillType.OUTCOME,
              holder: source,
              action,
              product: populatedProducts[i].requires[j].product,
              quantity:
                -populatedProducts[i].requires[j].quantity *
                populatedProducts[i].quantity,
            });
            outcomeTransactions.push(transaction);
          }
        }
        const incomeTransactions = await Promise.all(
          products.map(({ product, quantity }) =>
            this.transactionService.create({
              type: WaybillType.INCOME,
              holder: destination,
              action,
              product,
              quantity,
            }),
          ),
        );
        return [...incomeTransactions, ...outcomeTransactions];
      }
    }
  }

  prepareWaybillType = (
    waybill: TWaybill,
  ): [WaybillType] | [WaybillType, WaybillType] => {
    switch (waybill.action) {
      case WaybillAction.BUY:
      case WaybillAction.IMPORT:
        return [WaybillType.INCOME];
      case WaybillAction.SELL:
      case WaybillAction.UTILIZATION:
        return [WaybillType.OUTCOME];
      case WaybillAction.MOVE:
      case WaybillAction.PRODUCTION:
        return [WaybillType.INCOME, WaybillType.OUTCOME];
    }
  };

  prepareWaybillHolders = (waybill: TWaybill) => {
    switch (waybill.action) {
      case WaybillAction.BUY:
      case WaybillAction.IMPORT: {
        const { destination } = waybill;
        return { destination };
      }
      case WaybillAction.SELL:
      case WaybillAction.UTILIZATION: {
        const { source } = waybill;
        return { source };
      }
      case WaybillAction.MOVE:
      case WaybillAction.PRODUCTION: {
        const { source, destination } = waybill;
        return { source, destination };
      }
    }
  };
}
