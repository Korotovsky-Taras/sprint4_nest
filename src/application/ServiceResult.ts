import { ServiceError } from './ServiceError';

type ServiceErrorType = {
  message: string;
  code: number;
};

export class ServiceResult<T> {
  private data: T | null;
  private errors: ServiceErrorType[];
  constructor() {
    this.data = null;
    this.errors = [];
  }
  addError(error: ServiceErrorType) {
    this.errors.push(error);
  }

  hasErrors(): boolean {
    return this.errors.length > 0;
  }

  hasErrorCode(errorCode: number): boolean {
    return this.errors.map((err: ServiceErrorType) => err.code).includes(errorCode);
  }

  setData(data: T) {
    this.data = data;
  }

  getData(): T {
    if (this.data === null) {
      throw new ServiceError();
    }
    return this.data;
  }

  static createErrorResult(error: ServiceErrorType) {
    const serviceResult = new ServiceResult();
    serviceResult.addError(error);
    return serviceResult;
  }
}
