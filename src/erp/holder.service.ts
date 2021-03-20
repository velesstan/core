import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { HolderModel } from 'src/common/interfaces';
import { HolderRef } from 'src/common/schemas';

@Injectable()
export class HolderService {
  constructor(
    @InjectModel(HolderRef) private readonly holderModel: Model<HolderModel>,
  ) {}

  async find(): Promise<HolderModel[]> {
    return await this.holderModel.find().exec();
  }
}
