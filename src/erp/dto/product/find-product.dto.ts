import { IsString, IsOptional } from 'class-validator';

export class FindProductDto {
  @IsString()
  @IsOptional()
  readonly category?: string;
  @IsString()
  @IsOptional()
  readonly code?: string;
}
