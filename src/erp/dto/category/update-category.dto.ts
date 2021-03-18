import {
  MinLength,
  MaxLength,
  IsString,
  IsNumber,
  IsPositive,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

import { Category } from 'src/common/interfaces';

export class UpdateCategoryDto implements Category {
  @IsString()
  @MinLength(4)
  @MaxLength(15)
  @Transform(({ value }) => value.trim().replace(/^./, (c) => c.toUpperCase()))
  readonly title: string;

  @IsNumber()
  @IsPositive()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  readonly sortPriority?: number;
}
