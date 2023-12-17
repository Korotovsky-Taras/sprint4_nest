export interface IRepository<T> {
  clear(): Promise<void>;
  saveDoc(doc: T): Promise<void>;
}

export interface IService {}
