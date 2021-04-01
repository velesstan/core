import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsDate } from 'class-validator';
import dayjs from 'dayjs';

export class FindBalancesDto {
  @IsString()
  @IsOptional()
  readonly code?: string;

  @IsString()
  @IsOptional()
  readonly holder?: string;

  @IsString()
  @IsOptional()
  readonly category?: string;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => dayjs.utc(value).startOf('day').toDate())
  readonly startDate?: Date;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => dayjs.utc(value).endOf('day').toDate())
  readonly endDate?: Date;
}
