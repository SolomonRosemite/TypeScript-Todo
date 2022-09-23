import { DiagnosticSeverity } from "vscode-languageserver";

export interface IAction {
  actionKeyWord: string;
  diagnosticSeverity: DiagnosticSeverity;
}

export const actions: IAction[] = [
  {
    actionKeyWord: "TODO",
    diagnosticSeverity: DiagnosticSeverity.Information,
  },
  {
    actionKeyWord: "BUG",
    diagnosticSeverity: DiagnosticSeverity.Warning,
  },
  {
    actionKeyWord: "NOTE",
    diagnosticSeverity: DiagnosticSeverity.Hint,
  },
];
