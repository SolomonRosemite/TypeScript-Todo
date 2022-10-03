import {
  Diagnostic,
  DiagnosticSeverity,
  Position,
  Range,
  TextDocument,
  workspace,
} from "vscode";
import { IAction } from "./actions";
import { SimpleTodoConfig } from "./config";
import {
  createCommentData,
  DiagnosticsWithUri,
  ICommentData,
  IExtractAction,
  IExtractedCommentDataInfoType,
} from "./language";

export async function createDiagnosticsForWorkspace(
  config: SimpleTodoConfig
): Promise<DiagnosticsWithUri[]> {
  const foldersToExcludeString = config.foldersToExclude.join(",");
  const languagesToIncludeString = config.languagesToInclude.join(",");

  const files = await workspace.findFiles(
    `**/*.{${languagesToIncludeString}}`,
    `**/{${foldersToExcludeString}}/**`
  );

  const documentPromises = files.map(
    async (file) => await workspace.openTextDocument(file)
  );

  const documents = await Promise.all(documentPromises);

  return documents.flatMap((doc) =>
    createDiagnosticsForTextDocument(doc, config)
  );
}

export function createDiagnosticsForTextDocument(
  doc: TextDocument,
  config: SimpleTodoConfig
): DiagnosticsWithUri {
  const fileExtension = doc.fileName.substring(
    doc.fileName.lastIndexOf(".") + 1
  );

  const docProgrammingLanguageShouldNotBeChecked =
    !config.languagesToInclude.includes(fileExtension);

  if (docProgrammingLanguageShouldNotBeChecked) {
    return;
  }

  const docIsInExcludedFolder = config.foldersToExclude.some((folder) =>
    decodeURI(doc.fileName).includes(folder)
  );

  if (docIsInExcludedFolder) {
    return;
  }

  const diagnostics = config.actions.flatMap((action) =>
    createDiagnosticsForDocument(doc, action)
  );
  return { diagnostics: diagnostics, uri: doc.uri };
}

function createDiagnosticsForDocument(
  textDocument: TextDocument,
  action: IAction
): Diagnostic[] {
  const { actionName, diagnosticSeverity } = action;

  const { data, extract } = createCommentData(
    textDocument.languageId,
    actionName
  );

  if (data) {
    return createDiagnosticsByCommentData(
      diagnosticSeverity,
      textDocument,
      data
    );
  }

  return createDiagnosticsByExtract(
    diagnosticSeverity,
    textDocument,
    extract!,
    action
  );
}

function createDiagnosticsByExtract(
  diagnosticSeverity: DiagnosticSeverity,
  textDocument: TextDocument,
  extract: IExtractAction,
  action: IAction
): Diagnostic[] {
  const extractedData = extract(textDocument.getText());

  const diagnostics = Array.from(extractedData.values()).flatMap(
    (commentData) =>
      createExtractDiagnostics(
        diagnosticSeverity,
        textDocument,
        action,
        commentData.info.type,
        new Range(
          new Position(commentData.begin - 1, 0),
          new Position(commentData.end, 0)
        )
      )
  );

  return diagnostics;
}

function createExtractDiagnostics(
  diagnosticSeverity: DiagnosticSeverity,
  textDocument: TextDocument,
  action: IAction,
  commentType: IExtractedCommentDataInfoType,
  commentRange: Range
): Diagnostic[] {
  const diagnostics = [];
  const regex = RegExp(action.actionName, "gi");
  let regExpArray: RegExpExecArray | null;

  // Get all actions from document
  while ((regExpArray = regex.exec(textDocument.getText(commentRange)))) {
    let start = textDocument.positionAt(regExpArray.index);
    start = new Position(
      start.line + commentRange.start.line,
      commentType == "multiline" ? start.character : 0
    );

    const range = new Range(
      start,
      new Position(start.line, Number.MAX_VALUE - 1)
    );

    const commentText = textDocument.getText(range);
    const diagnostic: Diagnostic = {
      severity: diagnosticSeverity,
      range: range,
      message: commentText.substring(commentText.search(regex)).trim(),
      source: "Rosemite",
      code: "todo",
    };

    diagnostics.push(diagnostic);
  }

  return diagnostics;
}

function createDiagnosticsByCommentData(
  diagnosticSeverity: DiagnosticSeverity,
  textDocument: TextDocument,
  data: ICommentData
) {
  const { comment } = data;

  const regex = RegExp(comment, "gi");
  let regExpArray: RegExpExecArray | null;

  const diagnostics: Diagnostic[] = [];

  // Get all actions from document
  while ((regExpArray = regex.exec(textDocument.getText()))) {
    const range = new Range(
      textDocument.positionAt(regExpArray.index),
      new Position(
        textDocument.positionAt(regExpArray.index).line,
        Number.MAX_VALUE - 1
      )
    );

    const commentText = textDocument.getText(range);

    const diagnostic: Diagnostic = {
      severity: diagnosticSeverity,
      range: range,
      message: commentText.substring(commentText.search(regex)).trim(),
      source: "Rosemite",
      code: "todo",
    };

    diagnostics.push(diagnostic);
  }

  return diagnostics;
}
