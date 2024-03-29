import {
  IsString,
  Length,
  MinLength,
  MaxLength,
  IsNumber,
  IsPositive,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ICreateProductDto } from '@velesstan/interfaces';

export class CreateProductDto implements ICreateProductDto {
  @IsString()
  @Length(24)
  readonly category: string;
  @IsString()
  readonly unit: string;
  @IsString()
  @MinLength(3)
  @MaxLength(15)
  @Transform(({ value }) => value.trim().replace(/^./, (c) => c.toUpperCase()))
  readonly code: string;
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Transform(({ value }) => value.trim().replace(/^./, (c) => c.toUpperCase()))
  readonly title: string;
  @IsNumber({}, { message: 'Розничая цена должна быть числом' })
  @IsPositive({ message: 'Розничая цена должна быть положительным числом' })
  @Transform(({ value }) => Number(value))
  readonly price_retail: number;
  @IsNumber({}, { message: 'Оптовая цена должна быть числом' })
  @IsPositive({ message: 'Оптовая цена должна быть положительным числом' })
  @Transform(({ value }) => Number(value))
  readonly price_wholesale: number;

  @IsOptional()
  @IsNumber({}, { message: 'Себестоимость должна быть числом' })
  @IsPositive({ message: 'Себестоимость должна быть положительным числом' })
  @Transform(({ value }) => Number(value))
  readonly price_prime: number;

  @IsOptional()
  readonly requires: Array<any>;
}
