export class EntityRepoResult {
  commands: (() => Promise<any>)[] = [];
  async applyCommands(): Promise<void> {
    for (const c of this.commands) {
      await c();
    }
    this.commands.length = 0;
  }
  public addCommand(command: () => Promise<any>) {
    this.commands.push(command);
  }
}
