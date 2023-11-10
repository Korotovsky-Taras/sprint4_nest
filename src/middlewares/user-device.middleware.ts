import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class UserDeviceMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    req.userId = req.get('userId') || null;
    req.deviceId = req.get('deviceId') || null;
    console.log({ userId: req.userId }, JSON.stringify(req.body), JSON.stringify(req.query));
    next();
  }
}
