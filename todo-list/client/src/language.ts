import { window } from "vscode";

export interface ICommentConfiguration {
  comment: string;
  commentPrefixLength: number;
}

interface ILanguageConfiguration {
  name: string;
  commentPrefix: string;
  fixedCommentPrefixLength?: number;
}

const languages: ILanguageConfiguration[] = [
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

export function createCommentConfiguration(
  languageName: string,
  keyWord: string
): ICommentConfiguration {
  console.log(languageName);
  if (languageName.includes("e")) {
    window.showInformationMessage(languageName);
  }
  const language = languages.filter((lang) => lang.name === languageName);
  const defaultCommentPrefixLength = 2;

  if (language.length != 0) {
    return {
      comment: `${language[0].commentPrefix} ${keyWord}`,
      commentPrefixLength:
        language[0].fixedCommentPrefixLength ?? defaultCommentPrefixLength,
    };
  }

  // Default comment configuration
  return {
    comment: `// ${keyWord}`,
    commentPrefixLength: defaultCommentPrefixLength,
  };
}
