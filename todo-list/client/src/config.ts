import { workspace } from "vscode";
import { convertActionFromConfig, IAction, IConfigAction } from "./actions";

export class SimpleTodoConfig {
  public foldersToExclude: string[];
  public languagesToInclude: string[];

  private _actions: IAction[];
  public get actions(): IAction[] {
    return this._actions;
  }
  public set actions(v: IAction[]) {
    this._actions = v;
  }
  public set actionsFromConfig(v: IConfigAction[]) {
    this._actions = convertActionFromConfig(v);
  }

  constructor(private simpleTodoConfigurationKey: string) {
    this.reloadConfiguration();
  }

  public reloadConfiguration(): void {
    this.foldersToExclude = workspace
      .getConfiguration(this.simpleTodoConfigurationKey)
      .get<string[]>("overrideFoldersToIgnore");

    this.languagesToInclude = workspace
      .getConfiguration(this.simpleTodoConfigurationKey)
      .get<string[]>("overrideLanguagesToCheck");

    this.actionsFromConfig = workspace
      .getConfiguration(this.simpleTodoConfigurationKey)
      .get<IConfigAction[]>("overrideActionKeywords");
  }
}
