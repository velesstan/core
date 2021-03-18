import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards';

import { FindWaybillDto } from './dto/waybill';
import { WaybillService } from './waybill.service';

@Controller('waybills')
@UseGuards(JwtAuthGuard)
export class WaybillController {
  constructor(private readonly waybillService: WaybillService) {}

  @Get('/')
  async find(@Query() query: FindWaybillDto) {
    return await this.waybillService.find(query);
  }
}
