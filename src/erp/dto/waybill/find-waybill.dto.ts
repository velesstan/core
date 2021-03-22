import { IsString, IsOptional, IsNumber, IsDate } from 'class-validator';
import { Transform } from 'class-transformer';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export class FindWaybillDto {
  @IsString()
  @IsOptional()
  readonly _id?: string;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => Number(value))
  readonly serialNumber?: number;

  @IsString()
  @IsOptional()
  readonly holder?: string;

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => dayjs.utc(value).startOf('day').toDate())
  readonly startDate?: Date;

  @IsDate()
  @IsOptional()
  @Transform(({ value }) => dayjs.utc(value).endOf('day').toDate())
  readonly endDate?: Date;
}
