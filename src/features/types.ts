import { HydratedDocument } from 'mongoose';

export interface IRepository<T> {
  clear(): Promise<void>;
  saveDoc(doc: HydratedDocument<T>): Promise<void>;
}

export interface IService {}
