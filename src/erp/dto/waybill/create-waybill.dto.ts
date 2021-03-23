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
} from 'class-validator';
import { Type } from 'class-transformer';

import { WaybillAction } from 'src/common/enums';

class ProductSnapshotDto {
  @IsNumber()
  @IsPositive()
  readonly price: number;

  @IsBoolean()
  readonly reduce: boolean;
}

class ProductDto {
  @IsString()
  @IsNotEmpty()
  readonly product: string;
  @IsNumber()
  @IsPositive()
  readonly quantity: number;
  @ValidateNested()
  @Type(() => ProductSnapshotDto)
  readonly snapshot: ProductSnapshotDto;
}

export class CreateWaybillDto {
  @IsEnum(WaybillAction)
  @IsNotEmpty()
  readonly action: WaybillAction;
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly source?: string;
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  readonly destination?: string;
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ProductDto)
  readonly products: ProductDto[];
}
