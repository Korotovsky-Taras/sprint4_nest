import { TestsService } from '../../../src/features/tests/domain/tests.service';
import { ITestingDaoUtils } from './types';
import { UserConfirmation } from '../../../src/features/users/types/dao';

export class TestDaoUtils implements ITestingDaoUtils {
  constructor(private readonly testService: TestsService) {}

  getUserAuthConfirmationByLogin(login: string): Promise<UserConfirmation | null> {
    return this.testService.getUserAuthConfirmationByLogin(login);
  }

  clearAll(): Promise<void> {
    return this.testService.clearAll();
  }
}
