import { Diagnostic, Uri } from "vscode";

const extract = require("multilang-extract-comments");

type IExtractResult = Map<string, IExtractedCommentData>;
export type IExtractAction = (text: string) => IExtractResult;
export type IExtractedCommentDataInfoType = "singleline" | "multiline";

export interface DiagnosticsWithUri {
  diagnostics: Diagnostic[];
  uri: Uri;
}

export interface ICommentConfiguration {
  data?: ICommentData;
  extract?: IExtractAction;
}

export interface ICommentData {
  comment: string;
}

interface IExtractedCommentData {
  begin: number;
  end: number;
  content: string;
  info: IExtractedCommentDataInfo;
}

interface IExtractedCommentDataInfo {
  type: IExtractedCommentDataInfoType;
}

interface ILanguage {
  name: string;
  commentPrefix: string;
}

const languages: ILanguage[] = [
  {
    commentPrefix: "#",
    name: "elixir",
  },
  {
    commentPrefix: "<!--",
    name: "html",
  },
  {
    commentPrefix: "--",
    name: "lua",
  },
  {
    commentPrefix: "#",
    name: "powershell",
  },
  {
    commentPrefix: "#",
    name: "python",
  },
  {
    commentPrefix: "#",
    name: "yaml",
  },
];

export function createCommentData(
  languageName: string,
  actionName: string
): ICommentConfiguration {
  const language = languages.filter((lang) => lang.name === languageName);

  if (language.length != 0) {
    return {
      data: {
        comment: `${language[0].commentPrefix} ${actionName}`,
      },
    };
  }

  return {
    extract: (s: string) => new Map(Object.entries(extract(s))),
  };
}
