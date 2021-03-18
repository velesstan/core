import { Transform } from 'class-transformer';
import { IsString, IsOptional, IsDate } from 'class-validator';
import dayjs from 'dayjs';

export class FindTransactionsDto {
  @IsString()
  @IsOptional()
  readonly code?: string;

  @IsString()
  @IsOptional()
  readonly stock?: string;

  @IsString()
  @IsOptional()
  readonly category?: string;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => dayjs.utc(value).startOf('day').toDate())
  readonly start?: Date;

  @IsOptional()
  @IsDate()
  @Transform(({ value }) => dayjs.utc(value).endOf('day').toDate())
  readonly end?: Date;
}
