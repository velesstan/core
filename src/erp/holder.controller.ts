import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';

import { HolderModel } from 'src/common/interfaces';
import { CreateHolderDto, UpdateHolderDto } from './dto/holder';
import { HolderService } from './holder.service';

@Controller('holders')
export class HolderController {
  constructor(private readonly holderService: HolderService) {}

  @Get('/')
  async find(): Promise<HolderModel[]> {
    return await this.holderService.find();
  }

  @Get('/:id')
  async findById(@Param('id') id: string): Promise<HolderModel> {
    return await this.holderService.findById(id);
  }

  @Post('/')
  async create(@Body() holder: CreateHolderDto): Promise<HolderModel> {
    return await this.holderService.create(holder);
  }

  @Put('/:id')
  async update(
    @Param('id') id: string,
    @Body() holder: UpdateHolderDto,
  ): Promise<HolderModel> {
    return await this.holderService.update(id, holder);
  }

  @Delete('/:id')
  async delete(@Param('id') id: string): Promise<void> {
    await this.holderService.delete(id);
  }
}
