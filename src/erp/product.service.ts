import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductModel, Product } from '@velesstan/interfaces';

import { ProductRef } from 'src/common/schemas';
import { FindProductDto } from './dto/product';

@Injectable()
export class ProductService {
  constructor(
    @InjectModel(ProductRef) private readonly productModel: Model<ProductModel>,
  ) {}

  async find(query: FindProductDto): Promise<ProductModel[]> {
    const { category, code } = query;
    return await this.productModel
      .find({
        ...(category ? { category } : {}),
        ...(code ? { code: new RegExp(code, 'i') } : {}),
      })
      .sort({ code: 'ascending' })
      .populate([
        { path: 'category' },
        { path: 'requires', populate: 'product' },
      ])
      .exec();
  }

  async getById(id: string): Promise<ProductModel> {
    const $product = await this.productModel
      .findById(id)
      .populate([
        {
          path: 'requires',
          populate: [{ path: 'product', populate: 'category' }],
        },
      ])
      .exec();
    if ($product) return $product;
    else
      throw new HttpException('Resource doesnt exist', HttpStatus.BAD_REQUEST);
  }

  async create(product: Product): Promise<ProductModel> {
    return await (
      await new this.productModel(product).populate('category').save()
    ).execPopulate();
  }
  async updateById(id: string, product: Product): Promise<ProductModel | null> {
    return await this.productModel
      .findByIdAndUpdate(id, product, {
        new: true,
      })
      .populate('category')
      .exec();
  }
  async removeById(id: string) {
    return await this.productModel.findByIdAndRemove(id).exec();
    // TODO remove transactions
  }
}
