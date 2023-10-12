import { Injectable } from '@nestjs/common';
import { IAuthSessionService } from '../types/common';

@Injectable()
export class AuthSessionService implements IAuthSessionService {}
