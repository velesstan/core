import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { spawn } from 'child_process';
import { Transform } from 'stream';

@Injectable()
export class DatabaseBackupService {
  private DB_USER: string;
  private DB_PASSWORD: string;

  constructor(private readonly configService: ConfigService) {
    this.DB_PASSWORD = configService.get('MONGO_INITDB_ROOT_PASSWORD')!;
    this.DB_USER = configService.get('MONGO_INITDB_ROOT_USERNAME')!;
  }

  dumpDatabase(): Transform {
    const stream = new Transform();
    stream._transform = function (chunk, encoding, done) {
      this.push(chunk);
      done();
    };
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
}
