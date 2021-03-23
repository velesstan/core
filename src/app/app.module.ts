import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { DelayMiddleware } from 'src/common/middlewares';

import { UserModule } from 'src/user';
import { AuthModule } from 'src/auth';
import { ERPModule } from 'src/erp';
import CONFIG, { ENV_SCHEMA } from 'src/env.schema';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseBackupService } from './backup/database-backup.service';
import { DatabaseBackupController } from './backup/database-backup.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: ['app.env'],
      validationSchema: ENV_SCHEMA,
      load: [CONFIG],
      validationOptions: {
        abortEarly: true,
      },
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          uri: configService.get<string>('DB_CONNECTION'),
          useCreateIndex: true,
          useFindAndModify: false,
          useUnifiedTopology: true,
          useNewUrlParser: true,
        };
      },
    }),
    AuthModule,
    UserModule,
    ERPModule,
  ],
  controllers: [AppController, DatabaseBackupController],
  providers: [AppService, DatabaseBackupService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(DelayMiddleware).forRoutes('*');
  }
}
