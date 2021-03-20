import { Controller, Get } from '@nestjs/common';

import { HolderModel } from 'src/common/interfaces';
import { HolderService } from './holder.service';

@Controller('holders')
export class HolderController {
  constructor(private readonly holderService: HolderService) {}

  @Get('/')
  async find(): Promise<HolderModel[]> {
    return await this.holderService.find();
  }
}
