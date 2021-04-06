import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { Readable } from 'stream';

import { JwtAuthGuard } from 'src/common/guards';
import { WaybillModel } from 'src/common/interfaces';
import { DocumentService } from 'src/document';

import { CreateWaybillDto, FindWaybillDto } from './dto/waybill';
import { WaybillService } from './waybill.service';

@Controller('waybills')
@UseGuards(JwtAuthGuard)
export class WaybillController {
  constructor(
    private readonly waybillService: WaybillService,
    private readonly documentService: DocumentService,
  ) {}

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
  async delete(@Param('id') id: string): Promise<WaybillModel> {
    return await this.waybillService.deleteWaybill(id);
  }

  @Get('/print/:id')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment;')
  async printWaybill(@Param('id') id: string, @Res() response: Response) {
    try {
      const waybill = await this.waybillService.findById(id);
      Readable.from(await this.documentService.makeInvoice(waybill)).pipe(
        response,
      );
    } catch (e) {
      console.log(e);
      throw new HttpException(
        'Error creating generating invoice PDF.',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
