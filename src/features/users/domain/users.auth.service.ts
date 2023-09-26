import { Injectable } from '@nestjs/common';
import { UserConfirmation, UserEncodedPassword } from '../types/dao';
import crypto, { randomUUID } from 'crypto';

@Injectable()
export abstract class AbstractUsersService {
  _hashPassword(password: string): UserEncodedPassword {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = this._createPasswordHash(password, salt);
    return { salt, hash };
  }
  _verifyPassword(password: string, salt: string, hash: string): boolean {
    const newHash = this._createPasswordHash(password, salt);
    return newHash === hash;
  }
  _createPasswordHash(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 100, 24, 'sha512').toString('hex');
  }
  _createUserConfirmation(confirmed: boolean = false): UserConfirmation {
    const expiredDate: Date = new Date();
    expiredDate.setTime(expiredDate.getTime() + 3 * 1000 * 60);
    return {
      expiredIn: expiredDate,
      code: randomUUID(),
      confirmed,
    };
  }
}
