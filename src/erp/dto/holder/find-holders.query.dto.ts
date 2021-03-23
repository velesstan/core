import { IsString, IsOptional } from 'class-validator';

import { HolderType } from 'src/common/enums';

export class FindHoldersQueryDto {
  @IsString()
  @IsOptional()
  readonly type?: HolderType;

  @IsString()
  @IsOptional()
  readonly title?: string;
}
