const extract = require("multilang-extract-comments");

type IExtractResult = Map<string, IExtractedCommentData>;
export type IExtractAction = (text: string) => IExtractResult;
export type IExtractedCommentDataInfoType = "singleline" | "multiline";

export interface ICommentConfiguration {
  data?: ICommentData;
  extract?: IExtractAction;
}

export interface ICommentData {
  comment: string;
  commentPrefixLength: number;
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
  fixedCommentPrefixLength?: number;
}

const languages: ILanguage[] = [
  {
    commentPrefix: "#",
    name: "elixir",
  },
  {
    commentPrefix: "<!--",
    name: "html",
    fixedCommentPrefixLength: 0,
  },
  {
    commentPrefix: "--",
    name: "lua",
    fixedCommentPrefixLength: 0,
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
  keyWord: string
): ICommentConfiguration {
  const language = languages.filter((lang) => lang.name === languageName);
  const defaultCommentPrefixLength = 2;

  if (language.length != 0) {
    return {
      data: {
        comment: `${language[0].commentPrefix} ${keyWord}`,
        commentPrefixLength:
          language[0].fixedCommentPrefixLength ?? defaultCommentPrefixLength,
      },
    };
  }

  return {
    extract: (s: string) => new Map(Object.entries(extract(s))),
  };
}
