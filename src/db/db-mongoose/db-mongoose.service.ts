import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { DBService } from '../types';

@Injectable()
export class DbMongooseService implements DBService {
  constructor(@InjectConnection() private connection: Connection) {}

  async closeConnection() {
    await this.connection.close();
  }
}
