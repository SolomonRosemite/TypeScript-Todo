import { DiagnosticSeverity } from "vscode";

export interface IAction {
  actionName: string;
  diagnosticSeverity: DiagnosticSeverity;
}

export interface IConfigAction {
  actionName: string;
  severity: string;
}

export function convertActionFromConfig(actions: IConfigAction[]): IAction[] {
  return actions.map((action) => {
    return {
      actionName: action.actionName,
      diagnosticSeverity: parseDiagnosticSeverity(action.severity),
    };
  });
}

function parseDiagnosticSeverity(
  diagnosticSeverity: string
): DiagnosticSeverity {
  switch (diagnosticSeverity.toLowerCase()) {
    case "hint":
      return DiagnosticSeverity.Hint;
    default:
    case "information":
      return DiagnosticSeverity.Information;
    case "warning":
      return DiagnosticSeverity.Warning;
    case "error":
      return DiagnosticSeverity.Error;
  }
}
