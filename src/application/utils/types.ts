import { NextFunction, Request, Response } from 'express';

export enum RouterMethod {
  POST = 'post',
  PUT = 'put',
  DELETE = 'delete',
  GET = 'get',
}

export enum Status {
  OK = 200,
  CREATED = 201,
  NO_CONTENT = 204,
  BAD_REQUEST = 400,
  UNATHORIZED = 401,
  FORBIDDEN = 403,
  TO_MANY_REQUESTS = 429,
  NOT_FOUND = 404,
  DB_ERROR = 409,
  UNHANDLED = 500,
}

export type ParamIdModel = {
  id: string;
};

export type WithPaginationQuery = {
  sortBy: string;
  sortDirection: SortingDirection;
  pageNumber: number;
  pageSize: number;
};

export type WithPaginationResult<T> = {
  totalCount: number;
  items: T[];
};

export type WithPagination<T> = {
  pagesCount: number;
  page: number;
  pageSize: number;
  totalCount: number;
  items: T[];
};

export type EnhancedOmit<TRecordOrUnion, KeyUnion> = string extends keyof TRecordOrUnion
  ? TRecordOrUnion
  : TRecordOrUnion extends any
  ? Pick<TRecordOrUnion, Exclude<keyof TRecordOrUnion, KeyUnion>>
  : never;

export interface ParsedQs {
  [key: string]: undefined | string | string[] | ParsedQs | ParsedQs[];
}

// Дополнительная проверка на совпадение типов Query моделей
export type QueryGateModel<RegModel, RepoModel extends { [K in keyof RegModel]: any }> = {
  [K in keyof RepoModel]: RepoModel[K];
};

export type TupleUnion<U extends string, R extends string[] = []> = {
  [S in U]: Exclude<U, S> extends never ? [...R, S] : TupleUnion<Exclude<U, S>, [...R, S]>;
}[U] &
  string[];

export type SortingDirection = 'asc' | 'desc';

export interface PaginationQueryModel<T extends object> extends ParsedQs {
  sortBy?: Extract<keyof T, string>;
  sortDirection?: string;
  pageNumber?: string;
  pageSize?: string;
}

export type FieldError = {
  message: string;
  field: string;
};

export type ErrorsMessage = {
  errorsMessages: FieldError[];
};

export type RouteMiddleware = (req: Request, res: Response, next: NextFunction) => void;

export interface Route<T> {
  route: string;
  method: RouterMethod;
  controller: T;
  action: (req: Request<any>, res: Response<any>, next: NextFunction) => Promise<Response>; //TODO надо связать action c controller
  middlewares?: RouteMiddleware[];
}

export type UserIdReq = string | null;

export type DeviceIdReq = string | null;

export type WithUserId = {
  userId: string;
};

export type WithExpiredIn = {
  expiredIn: string;
};

export type WithDbId<T> = T & { _id: string };
