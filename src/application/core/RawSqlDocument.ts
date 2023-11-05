import { Document } from 'mongoose';

export class RawSqlDocument<Model> extends Document<unknown, Model> {}
