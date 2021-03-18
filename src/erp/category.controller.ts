import {
  Controller,
  Get,
  Body,
  Post,
  Put,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from 'src/common/guards';
import { CategoryModel } from 'src/common/interfaces';

import { CreateCategoryDto, UpdateCategoryDto } from './dto/category';
import { CategoryService } from './category.service';

@Controller('/categories')
@UseGuards(JwtAuthGuard)
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Get('/')
  async find(): Promise<CategoryModel[]> {
    return await this.categoryService.find();
  }
  @Post('/')
  async createCategory(
    @Body() category: CreateCategoryDto,
  ): Promise<CategoryModel> {
    return await this.categoryService.create(category);
  }
  @Put('/:id')
  async updateCategory(
    @Param('id') id: string,
    @Body() category: UpdateCategoryDto,
  ) {
    return await this.categoryService.updateById(id, category);
  }
  @Delete('/:id')
  async removeCategory(@Param('id') id: string) {
    return await this.categoryService.removeById(id);
  }
}
