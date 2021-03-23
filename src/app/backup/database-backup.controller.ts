import { Controller, Get, Header, Res } from '@nestjs/common';
import { Response } from 'express';

import { DatabaseBackupService } from './database-backup.service';

@Controller('backup')
export class DatabaseBackupController {
  constructor(private readonly backupService: DatabaseBackupService) {}

  @Get('database')
  @Header('Content-Type', 'application/x-binary')
  getHello(@Res() response: Response) {
    response.setHeader('Content-Disposition', 'attachment; filename=db.dump');
    this.backupService.dumpDatabase().pipe(response);
  }
}
