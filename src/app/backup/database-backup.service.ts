import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'child_process';
import { PassThrough } from 'stream';

@Injectable()
export class DatabaseBackupService {
  private DB_USER: string;
  private DB_PASSWORD: string;

  constructor(private readonly configService: ConfigService) {
    this.DB_PASSWORD = configService.get('MONGO_INITDB_ROOT_PASSWORD')!;
    this.DB_USER = configService.get('MONGO_INITDB_ROOT_USERNAME')!;
  }

  dumpDatabase(): PassThrough {
    const stream = new PassThrough();
    const docker = spawn('docker-compose', [
      'exec',
      '-T',
      'database',
      'sh',
      '-c',
      `mongodump --archive -d core-veles -u ${this.DB_USER} -p ${this.DB_PASSWORD} --authenticationDatabase admin > /data/db/db.dump && cat /data/db/db.dump`,
    ]);
    docker.stdout.pipe(stream);
    docker.on('exit', () => stream.end());
    return stream;
  }

  async restoreDatabase(file: Express.Multer.File): Promise<void> {
    return new Promise((resolve, reject) => {
      const stream = new PassThrough();
      const docker = spawn('docker-compose', [
        'exec',
        '-T',
        'database',
        'sh',
        '-c',
        `mongorestore --archive --drop -u ${this.DB_USER} -p ${this.DB_PASSWORD} --authenticationDatabase admin < /dev/stdin`,
      ]);
      stream.pipe(docker.stdin);
      stream.end(Buffer.from(file.buffer));
      stream.on('close', () => {
        resolve();
      });
    });
  }
}
