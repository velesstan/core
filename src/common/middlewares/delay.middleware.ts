import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class DelayMiddleware implements NestMiddleware {
  async use(request: Request, response: Response, next: NextFunction) {
    await this.delay(1);
    next();
  }

  async delay(max: number): Promise<void> {
    const time = max * 1000;
    return new Promise((resolve) => {
      setTimeout(resolve, time);
    });
  }
}
