import { IsString, MinLength, MaxLength } from 'class-validator';
import { Transform } from 'class-transformer';

import { Holder } from 'src/common/interfaces';
import { HolderType } from 'src/common/enums';

export class UpdateHolderDto implements Holder {
  @IsString()
  @MinLength(3)
  @MaxLength(50)
  @Transform(({ value }) => value.trim())
  readonly title: string;

  @IsString()
  readonly type: HolderType;
}
