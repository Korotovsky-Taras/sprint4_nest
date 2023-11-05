export interface RepoEntityMethods {
  save(): Promise<void>;
}

export abstract class EntityRepo implements RepoEntityMethods {
  abstract save(): Promise<void>;
}
