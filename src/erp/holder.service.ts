import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { HolderModel } from 'src/common/interfaces';
import { HolderRef } from 'src/common/schemas';
import {
  CreateHolderDto,
  FindHoldersQueryDto,
  UpdateHolderDto,
} from './dto/holder';

@Injectable()
export class HolderService {
  constructor(
    @InjectModel(HolderRef) private readonly holderModel: Model<HolderModel>,
  ) {}

  async find(query: FindHoldersQueryDto): Promise<HolderModel[]> {
    const { title, ...rest } = query;
    return await this.holderModel
      .find({
        ...rest,
        ...(title ? { title: new RegExp(`${title}`, 'i') } : {}),
      })
      .exec();
  }

  async findById(id: string): Promise<HolderModel> {
    const $holder = await this.holderModel.findById(id).exec();
    if ($holder) return $holder;
    else
      throw new HttpException('Resource doesnt exist', HttpStatus.BAD_REQUEST);
  }

  async create(holder: CreateHolderDto): Promise<HolderModel> {
    return await new this.holderModel(holder).save();
  }

  async update(id: string, holder: UpdateHolderDto): Promise<HolderModel> {
    const $holder = await this.holderModel.findById(id).exec();
    if ($holder) {
      return await $holder.update(holder, { new: true }).exec();
    } else
      throw new HttpException('Resource doesnt exist', HttpStatus.BAD_REQUEST);
  }

  async delete(id: string): Promise<void> {
    const $holder = await this.holderModel.findByIdAndRemove(id);
  }
}
