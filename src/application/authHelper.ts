import { Injectable } from '@nestjs/common';
import { Request, Response } from 'express';

@Injectable()
export class AuthHelper {
  private sessionTokenName: string = 'refreshToken';

  applyRefreshToken(res: Response, refreshToken: string) {
    res.cookie(this.sessionTokenName, refreshToken, { httpOnly: true, secure: true });
  }

  clearRefreshToken(res: Response): void {
    res.clearCookie(this.sessionTokenName);
  }

  getRefreshToken(req: Request): string | null {
    const cookies = req.cookies;
    return typeof cookies === 'object' ? cookies[this.sessionTokenName] : null;
  }

  getUserAgent(req: Request): string {
    return req.header('user-agent') || 'unknown';
  }

  getIp(req: Request): string {
    return req.ip;
  }
}
