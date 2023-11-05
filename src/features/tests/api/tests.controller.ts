import { Controller, Delete, HttpCode, Injectable } from '@nestjs/common';
import { Status } from '../../../application/utils/types';
import { TestsService } from '../domain/tests.service';

@Injectable()
@Controller('testing')
export class TestsController {
  constructor(private readonly testsService: TestsService) {}

  @Delete('all-data')
  @HttpCode(Status.NO_CONTENT)
  async deleteAll() {
    await this.testsService.clearAll();
  }
}
