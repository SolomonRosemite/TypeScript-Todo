import * as path from "path";
import {
  workspace,
  ExtensionContext,
  commands,
  TextDocument,
  languages,
  Diagnostic,
  Position,
  DiagnosticSeverity,
  Range,
  window,
  GlobPattern,
} from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient";

let client: LanguageClient;

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

  workspace
    .findFiles(
      "**/*.{ts,js,html,bat,c,cpp,cs,go,java,lua,php,yaml,py,swift,dart}",
      "**/{Library,node_modules}/**"
    )
    .then((files) => {
      // Foreach textDocument highlight todo
      for (let i = 0; i < files.length; i++) {
        workspace.openTextDocument(files[i]).then((textDocument) => {
          let text = textDocument.getText();

          const values = GetRightLanguage(textDocument.languageId);
          let patternV2 = RegExp(values[0], "g");

          let m: RegExpExecArray | null;
          let diagnostics: Diagnostic[] = [];

          while ((m = patternV2.exec(text.toUpperCase()))) {
            const end = new Position(
              textDocument.positionAt(m.index).line,
              Number.MAX_VALUE - 1
            );

            const range = new Range(textDocument.positionAt(m.index), end);

            const line = textDocument.getText(range);
            let diagnostic: Diagnostic = {
              severity: DiagnosticSeverity.Information,
              range: range,
              message: line.substring(parseInt(values[1])).trimRight(),
              source: "Rosemite",
              code: "todo",
            };
            diagnostics.push(diagnostic);
          }
          client.diagnostics.set(textDocument.uri, diagnostics);
        });
      }
    });

  function GetRightLanguage(languageId: string): string[] {
    switch (languageId) {
      case "python":
        return ["# TODO*", "2"];
      case "yaml":
        return ["# TODO*", "2"];
      case "html":
        return ["<!-- TODO*", "0"];
      case "lua":
        return ["-- TODO*", "0"];
      default:
        return ["// TODO*", "2"];
    }
  }
}

export function deactivate(): Thenable<void> | undefined {
  if (!client) {
    return undefined;
  }
  return client.stop();
}
