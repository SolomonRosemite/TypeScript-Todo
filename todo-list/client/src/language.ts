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
    name: "python",
  },
  {
    commentPrefix: "#",
    name: "powershell",
  },
  {
    commentPrefix: "#",
    name: "yaml",
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
    commentPrefix: "//",
    name: "python",
  },
];

export function createCommentConfiguration(
  languageName: string,
  keyWord: string
): ICommentConfiguration {
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
