import * as path from "path";
import { workspace, ExtensionContext, Diagnostic } from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient";
import { SimpleTodoConfig } from "./config";
import {
  createDiagnosticsForTextDocument,
  createDiagnosticsForWorkspace,
} from "./helpers";
import { DiagnosticsWithUri } from "./language";

let client: LanguageClient;
const simpleTodoConfigurationKey = "simpleTodo";
const simpleTodoConfiguration = new SimpleTodoConfig(
  simpleTodoConfigurationKey
);

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

  context.subscriptions.push(
    workspace.onDidChangeTextDocument((e) =>
      publishDiagnostics([
        createDiagnosticsForTextDocument(e.document, simpleTodoConfiguration),
      ])
    ),
    workspace.onDidChangeConfiguration(async (e) => {
      if (e.affectsConfiguration(simpleTodoConfigurationKey)) {
        // Although diagnostics for a text document get cleared anyway when setting new diagnostics, we still clear
        // because the user might have added new folders to exclude and for those the diagnostics have to be removed.
        client.diagnostics.clear();
        simpleTodoConfiguration.reloadConfiguration();
        publishDiagnostics(
          await createDiagnosticsForWorkspace(simpleTodoConfiguration)
        );
      }
    })
  );
  createDiagnosticsForWorkspace(simpleTodoConfiguration).then(
    publishDiagnostics
  );
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}

function publishDiagnostics(diagnostics: DiagnosticsWithUri[]): void {
  diagnostics.forEach((diagnostic) =>
    client.diagnostics.set(diagnostic.uri, diagnostic.diagnostics)
  );
}
