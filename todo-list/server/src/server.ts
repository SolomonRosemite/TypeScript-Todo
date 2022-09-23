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
  PublishDiagnosticsParams,
} from "vscode-languageserver";

import { TextDocument } from "vscode-languageserver-textdocument";
import { IAction, actions } from "./actions";
import { createCommentData } from "./language";

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

documents.onDidChangeContent((event) => {
  const diagnostics = actions
    .map((action) => createDiagnosticsForDocument(event.document, action))
    .flat();

  connection.sendDiagnostics({
    uri: event.document.uri,
    diagnostics,
  });
});

function createDiagnosticsForDocument(
  textDocument: TextDocument,
  action: IAction
): Diagnostic[] {
  const { actionKeyWord, diagnosticSeverity } = action;
  const docContent = textDocument.getText();

  // Returns RegExp for current used Language
  const { comment, commentPrefixLength } = createCommentData(
    textDocument.languageId,
    actionKeyWord
  );

  const regex = RegExp(comment, "g");
  let regExpArray: RegExpExecArray | null;

  const diagnostics: Diagnostic[] = [];

  // Get all actions from document
  while ((regExpArray = regex.exec(docContent.toUpperCase()))) {
    const range: Range = {
      start: textDocument.positionAt(regExpArray.index),
      end: {
        line: textDocument.positionAt(regExpArray.index).line,
        character: Number.MAX_VALUE - 1,
      },
    };

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
