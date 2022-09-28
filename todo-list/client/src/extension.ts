import * as path from "path";
import {
  workspace,
  ExtensionContext,
  TextDocument,
  Diagnostic,
  Range,
  Position,
  window,
} from "vscode";

import {
  DiagnosticSeverity,
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient";
import { actions, IAction } from "./actions";
import {
  createCommentData,
  ICommentData,
  IExtractAction,
  IExtractedCommentDataInfoType,
} from "./language";

let client: LanguageClient;
const simpleTodoConfigurationKey = "simpleTodo";

export function activate(context: ExtensionContext) {
  let serverModule = context.asAbsolutePath(
    path.join("server", "out", "server.js")
  );
  let debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };

  let serverOptions: ServerOptions = {
    run: { module: serverModule, transport: TransportKind.ipc },
    debug: {
      module: serverModule,
      transport: TransportKind.ipc,
      options: debugOptions,
    },
  };

  let clientOptions: LanguageClientOptions = {
    documentSelector: [{ scheme: "file", language: "*" }],
    synchronize: {
      fileEvents: workspace.createFileSystemWatcher("**/.clientrc"),
    },
  };

  client = new LanguageClient(
    "RosemiteTodos",
    "Todos",
    serverOptions,
    clientOptions
  );

  client.start();

  // Listening to configuration changes
  context.subscriptions.push(
    workspace.onDidChangeConfiguration((e) => {
      if (e.affectsConfiguration(simpleTodoConfigurationKey)) {
        client.diagnostics.clear();
        createDiagnosticsForWorkspace();
      }
    })
  );
  createDiagnosticsForWorkspace();
}

function createDiagnosticsForWorkspace() {
  const foldersToExclude = workspace
    .getConfiguration(simpleTodoConfigurationKey)
    .get<string[]>("overrideFoldersToIgnore");

  const languagesToInclude = workspace
    .getConfiguration(simpleTodoConfigurationKey)
    .get<string[]>("overrideLanguagesToCheck");

  const foldersToExcludeString = foldersToExclude.join(",");
  const languagesToIncludeString = languagesToInclude.join(",");

  workspace
    .findFiles(
      `**/*.{${languagesToIncludeString}}`,
      `**/{${foldersToExcludeString}}/**`
    )
    .then((files) => {
      files.forEach((file) => {
        workspace.openTextDocument(file).then((doc) => {
          const diagnostics = actions
            .map((action) => createDiagnosticsForDocument(doc, action))
            .flat();

          client.diagnostics.set(doc.uri, diagnostics);
        });
      });
    });
}

function createDiagnosticsForDocument(
  textDocument: TextDocument,
  action: IAction
): Diagnostic[] {
  const { actionKeyWord, diagnosticSeverity } = action;

  // Returns RegExp for current used Language
  const { data, extract } = createCommentData(
    textDocument.languageId,
    actionKeyWord
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
  const regex = RegExp(action.actionKeyWord, "g");
  let regExpArray: RegExpExecArray | null;

  // Get all actions from document
  while (
    (regExpArray = regex.exec(textDocument.getText(commentRange).toUpperCase()))
  ) {
    let start = textDocument.positionAt(regExpArray.index);
    start = new Position(
      start.line + commentRange.start.line,
      commentType == "multiline" ? start.character : 0
    );

    const range = new Range(
      start,
      new Position(start.line, Number.MAX_VALUE - 1)
    );

    const diagnostic: Diagnostic = {
      severity: diagnosticSeverity,
      range: range,
      message: textDocument
        .getText(range)
        .substring(commentType == "singleline" ? 3 : 0)
        .trimEnd(),
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
  const { comment, commentPrefixLength } = data;

  const regex = RegExp(comment, "g");
  let regExpArray: RegExpExecArray | null;

  const diagnostics: Diagnostic[] = [];

  // Get all actions from document
  while ((regExpArray = regex.exec(textDocument.getText().toUpperCase()))) {
    const range = new Range(
      textDocument.positionAt(regExpArray.index),
      new Position(
        textDocument.positionAt(regExpArray.index).line,
        Number.MAX_VALUE - 1
      )
    );

    const diagnostic: Diagnostic = {
      severity: diagnosticSeverity,
      range: range,
      message: textDocument
        .getText(range)
        .substring(commentPrefixLength)
        .trimEnd(),
      source: "Rosemite",
      code: "todo",
    };

    diagnostics.push(diagnostic);
  }

  return diagnostics;
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
