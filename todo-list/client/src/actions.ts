import { DiagnosticSeverity } from "vscode-languageclient";

export interface IAction {
  actionKeyWord: string;
  diagnosticSeverity: DiagnosticSeverity;
}

// NOTE: For some reason the DiagnosticSeverity type doesn't correspond to the name of the DiagnosticSeverity.
// For example the DiagnosticSeverity.Warning is actually a DiagnosticSeverity.Information.
// However on in the server.ts this issue doesn't occur.
export const actions: IAction[] = [
  {
    actionKeyWord: "TODO",
    diagnosticSeverity: DiagnosticSeverity.Warning,
  },
  {
    actionKeyWord: "BUG",
    diagnosticSeverity: DiagnosticSeverity.Error,
  },
  {
    actionKeyWord: "NOTE",
    diagnosticSeverity: DiagnosticSeverity.Information,
  },
];
