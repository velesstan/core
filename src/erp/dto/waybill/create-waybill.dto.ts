import {
  IsString,
  IsNumber,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsPositive,
  IsEnum,
  ArrayMinSize,
  IsBoolean,
  IsDate,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';
import dayjs from 'dayjs';

import { WaybillAction } from 'src/common/enums';

class ProductDto {
  @IsString()
  @IsNotEmpty()
  readonly product: string;
  @IsNumber()
  @IsPositive()
  readonly quantity: number;
  @IsBoolean()
  readonly discount: boolean;
}

export class CreateWaybillDto {
  @IsEnum(WaybillAction)
  @IsNotEmpty()
  readonly action: WaybillAction;
  @IsOptional()
  @IsDate()
  @Transform(({ value }) => dayjs.utc(value).toDate())
  readonly createdAt: Date;
  @IsString()
  @IsNotEmpty()
  readonly user: string;
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly source: string;
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly destination: string;
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  readonly products: ProductDto[];
}
