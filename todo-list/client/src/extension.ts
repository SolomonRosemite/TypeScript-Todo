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
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient";
import { actions, IAction } from "./actions";
import { createCommentConfiguration } from "./language";

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
  const docContent = textDocument.getText();

  // Returns RegExp for current used Language
  const { comment, commentPrefixLength } = createCommentConfiguration(
    textDocument.languageId,
    actionKeyWord
  );

  const regex = RegExp(comment, "g");
  let regExpArray: RegExpExecArray | null;

  const diagnostics: Diagnostic[] = [];

  // Get all actions from document
  while ((regExpArray = regex.exec(docContent.toUpperCase()))) {
    const end = new Position(
      textDocument.positionAt(regExpArray.index).line,
      Number.MAX_VALUE - 1
    );

    const range = new Range(textDocument.positionAt(regExpArray.index), end);

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
