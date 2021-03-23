import {
  Controller,
  Get,
  Header,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response, Express } from 'express';

import { DatabaseBackupService } from './database-backup.service';

@Controller('backup')
export class DatabaseBackupController {
  constructor(private readonly backupService: DatabaseBackupService) {}

  @Get('database')
  @Header('Content-Type', 'application/x-binary')
  async backupDatabase(@Res() response: Response) {
    response.setHeader('Content-Disposition', 'attachment; filename=db.dump');
    this.backupService.dumpDatabase().pipe(response);
  }

  @Post('database')
  @UseInterceptors(FileInterceptor('file'))
  async restoreDatabase(
    @UploadedFile() dabataseDump: Express.Multer.File,
  ): Promise<void> {
    return await this.backupService.restoreDatabase(dabataseDump);
  }
}
