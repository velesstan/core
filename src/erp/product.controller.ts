import {
  Controller,
  Get,
  Body,
  Post,
  Put,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/common/guards';

import { ProductModel } from 'src/common/interfaces';
import {
  CreateProductDto,
  FindProductDto,
  UpdateProductDto,
} from './dto/product';

import { ProductService } from './product.service';

@Controller('/products')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get('/')
  async find(@Query() query: FindProductDto): Promise<ProductModel[]> {
    return await this.productService.find(query);
  }
  @Post('/')
  async createProduct(
    @Body() product: CreateProductDto,
  ): Promise<ProductModel> {
    return await this.productService.create(product);
  }
  @Put('/:id')
  async updateProduct(
    @Param('id') id: string,
    @Body() product: UpdateProductDto,
  ) {
    return await this.productService.updateById(id, product);
  }
  @Delete('/:id')
  async removeProduct(@Param('id') id: string) {
    return await this.productService.removeById(id);
  }
}
