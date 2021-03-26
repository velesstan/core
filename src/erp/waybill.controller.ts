import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from 'src/common/guards';
import { WaybillModel } from 'src/common/interfaces';

import { CreateWaybillDto, FindWaybillDto } from './dto/waybill';
import { WaybillService } from './waybill.service';

@Controller('waybills')
@UseGuards(JwtAuthGuard)
export class WaybillController {
  constructor(private readonly waybillService: WaybillService) {}

  @Get('/')
  async find(@Query() query: FindWaybillDto) {
    return await this.waybillService.find(query);
  }

  @Get('/:id')
  async getById(@Param('id') id: string): Promise<WaybillModel> {
    return await this.waybillService.findById(id);
  }

  @Post('/')
  async create(@Body() waybill: CreateWaybillDto) {
    return await this.waybillService.create(waybill);
  }

  @Put('/:id')
  async update(@Param('id') id: string, @Body() waybill: CreateWaybillDto) {
    return await this.waybillService.update(id, waybill);
  }

  @Delete('/:id')
  async delete(@Param('id') id: string): Promise<void> {
    return await this.waybillService.deleteWaybill(id);
  }
}
