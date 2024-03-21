export interface DBService {
  closeConnection(): Promise<void>;
}
