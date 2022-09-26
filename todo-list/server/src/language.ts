export interface ICommentData {
  comment: string;
  commentPrefixLength: number;
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
): ICommentData {
  const language = languages.filter((lang) => lang.name === languageName);
  const defaultCommentPrefixLength = 2;

  if (language.length != 0) {
    return {
      comment: `${language[0].commentPrefix} ${keyWord}`,
      commentPrefixLength:
        language[0].fixedCommentPrefixLength ?? defaultCommentPrefixLength,
    };
  }

  return {
    comment: `// ${keyWord}`,
    commentPrefixLength: defaultCommentPrefixLength,
  };
}
