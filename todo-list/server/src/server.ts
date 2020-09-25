import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult,
  Range,
} from "vscode-languageserver";

import { TextDocument } from "vscode-languageserver-textdocument";

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
let connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
let documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability: boolean = false;
let hasWorkspaceFolderCapability: boolean = false;
let hasDiagnosticRelatedInformationCapability: boolean = false;

connection.onInitialize((params: InitializeParams) => {
  let capabilities = params.capabilities;

  hasConfigurationCapability = !!(
    capabilities.workspace && !!capabilities.workspace.configuration
  );
  hasWorkspaceFolderCapability = !!(
    capabilities.workspace && !!capabilities.workspace.workspaceFolders
  );
  hasDiagnosticRelatedInformationCapability = !!(
    capabilities.textDocument &&
    capabilities.textDocument.publishDiagnostics &&
    capabilities.textDocument.publishDiagnostics.relatedInformation
  );

  const result: InitializeResult = {
    capabilities: {
      textDocumentSync: TextDocumentSyncKind.Full,
      // Tell the client that this server supports code completion.
      completionProvider: {
        resolveProvider: true,
      },
    },
  };
  if (hasWorkspaceFolderCapability) {
    result.capabilities.workspace = {
      workspaceFolders: {
        supported: true,
      },
    };
  }
  return result;
});

connection.onInitialized(() => {
  if (hasConfigurationCapability) {
    // Register for all configuration changes.
    connection.client.register(
      DidChangeConfigurationNotification.type,
      undefined
    );
  }
});

documents.onDidChangeContent((change) => {
  validateTextDocument(change.document);
});

async function validateTextDocument(textDocument: TextDocument): Promise<void> {
  // Get current textDocument
  const text = textDocument.getText();

  // Returns RegExp for current used Language
  const values = GetRightLanguage(textDocument.languageId);
  const patternV2 = RegExp(values[0], "g");
  let m: RegExpExecArray | null;

  // Store Diagnostics
  let diagnostics: Diagnostic[] = [];

  // Get all todos from text
  while ((m = patternV2.exec(text.toUpperCase()))) {
    const range: Range = {
      start: textDocument.positionAt(m.index),
      end: {
        line: textDocument.positionAt(m.index).line,
        character: Number.MAX_VALUE - 1,
      },
    };

    // Create Diagnostic
    const diagnostic: Diagnostic = {
      severity: DiagnosticSeverity.Information,
      range: range,
      message: textDocument
        .getText(range)
        .substring(parseInt(values[1]))
        .trimEnd(),
      source: "Rosemite",
      code: "todo",
    };

    // Add Diagnostic to list
    diagnostics.push(diagnostic);
  }

  // Send Diagnostics to client
  connection.sendDiagnostics({ uri: textDocument.uri, diagnostics });
}

// Returns RegExp for current used Language
function GetRightLanguage(languageId: string): string[] {
  switch (languageId) {
    case "python":
      return ["# TODO", "2"];
    case "powershell":
      return ["# TODO", "2"];
    case "yaml":
      return ["# TODO", "2"];
    case "html":
      return ["<!-- TODO", "0"];
    case "lua":
      return ["-- TODO", "0"];
    default:
      return ["// TODO", "2"];
  }
}

// This handler provides the initial list of the completion items.
connection.onCompletion(
  (_textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
    return [];
  }
);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();
