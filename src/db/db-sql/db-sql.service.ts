import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { DBService } from '../types';

@Injectable()
export class DbSqlService implements DBService {
  constructor(@InjectDataSource() private dataSource: DataSource) {}

  async closeConnection() {
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }
}
