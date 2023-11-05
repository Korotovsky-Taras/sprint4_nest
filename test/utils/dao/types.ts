import { UserConfirmation } from '../../../src/features/users/types/dao';

export interface ITestingDaoUtils {
  getUserAuthConfirmationByLogin(login: string): Promise<UserConfirmation | null>;
  clearAll(): Promise<void>;
}
