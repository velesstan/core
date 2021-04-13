import { IsString, IsOptional } from 'class-validator';
import { IFindProductDto } from '@velesstan/interfaces';

export class FindProductDto implements IFindProductDto {
  @IsString()
  @IsOptional()
  readonly category?: string;
  @IsString()
  @IsOptional()
  readonly code?: string;
}
