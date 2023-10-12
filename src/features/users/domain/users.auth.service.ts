import { Injectable } from '@nestjs/common';
import { UserConfirmation, UserEncodedPassword } from '../types/dao';
import crypto, { randomUUID } from 'crypto';

@Injectable()
export abstract class AbstractUsersService {
  hashPassword(password: string): UserEncodedPassword {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = this.createPasswordHash(password, salt);
    return { salt, hash };
  }
  verifyPassword(password: string, salt: string, hash: string): boolean {
    const newHash = this.createPasswordHash(password, salt);
    return newHash === hash;
  }
  createPasswordHash(password: string, salt: string): string {
    return crypto.pbkdf2Sync(password, salt, 100, 24, 'sha512').toString('hex');
  }
  createUserConfirmation(confirmed: boolean = false): UserConfirmation {
    const expiredDate: Date = new Date();
    expiredDate.setTime(expiredDate.getTime() + 3 * 1000 * 60);
    return {
      expiredIn: expiredDate,
      code: randomUUID(),
      confirmed,
    };
  }
}
