<p align="center">
  <img src="https://raw.githubusercontent.com/SolomonRosemite/TypeScript-Todo/50c68aaf16bc428751cc6505dd35e12d93d960f8/todo-list/assets/icon.png" width="80">
  <h1 align="center">Simple Todo</h1>
  <h4 align="center"><a href="https://marketplace.visualstudio.com/items?itemName=SolomonRosemite.lsp-todo"><code>Try it Now</code></a></h4>
  <p align="center">A Todo list Extension made for Visual Studio Code</p>
  <p align="center">
    <img src="https://img.shields.io/badge/type-Project-orange?style=flat-square" alt="Repo Type" />
    <img src="https://img.shields.io/badge/language-Typescript-blue?style=flat-square" alt="Repo Main Language" />
    <img src="https://img.shields.io/badge/platform-Visual Studio Code-yellow?style=flat-square" alt="Project Platform" />
  </p>

![](https://raw.githubusercontent.com/SolomonRosemite/TypeScript-Todo/master/todo-list/assets/example.png)

### Table of Contents 📖

- [About](#about)
- [Getting Started](#getting-started)
  - [Installation](#installation)
  - [Configuration](#configuration)
  - [Action Keywords](#action-keywords)
  - [Folders to Exclude](#folders-to-exclude)
  - [Languages to Include](#languages-to-include)
- [Test and Run Locally](#test-and-run-locally)
  - [Requirements](#requirements)
  - [Installing](#installing)
- [Tools](#tools)
- [License](https://github.com/SolomonRosemite/TypeScript-Todo/blob/master/LICENSE)

# About

_Simple todo_ is a Visual Studio Code
[Language Server Extension](https://code.visualstudio.com/api/language-extensions/language-server-extension-guide)
that provides a simple todo list for your workspace. It can be configured to
your liking and settings shared across team members.

Feel free to share any ideas or suggestions that you may have.

# Getting Started

## Installation

The installation process is fairly simple as it can be
[installed from the Visual Studio Code Marketplace](https://marketplace.visualstudio.com/items?itemName=SolomonRosemite.lsp-todo).

## Configuration

All settings can be configured in the settings.json file. In the case of a
shared workspace, the settings can be configured in the .vscode folder.
[See here a more detailed guide](https://code.visualstudio.com/docs/getstarted/settings#_workspace-settings).

### Action keywords

As of v1.9.0 _Simple todo_ supports overriding actions, as requested in
https://github.com/SolomonRosemite/TypeScript-Todo/issues/12.

Like all the other options, these can be configured in the settings.json and
would look something like this:

```jsonc
{
  "simpleTodo.overrideActionKeywords": [
    {
      "actionName": "Todo:",
      "severity": "Information"
    },
    {
      "actionName": "Bug:",
      "severity": "Warning"
    },
    {
      "actionName": "Fix:",
      "severity": "Information"
    },
    {
      "actionName": "Note:",
      "severity": "Hint"
    }
  ]
}
```

Note that the actions names and severity levels are not case sensitive.

### Folders to exclude

If you want to exclude certain folders from being searched for todos, you can do
so by defining the following setting:

```jsonc
{
  "simpleTodo.overrideFoldersToIgnore": [
    // Default exclusions
    "Library",
    "node_modules",
    "dist",
    "build",
    ".next",
    // Custom added exclusions
    "prod",
    "vendor"
  ]
}
```

Note that when overriding the default exclusions, you will need to add them back
if you want them to be excluded.

### Languages to include

If you are a chad and use elixir or something else, you may consider configuring
a language that is not defined in the defaults. See example below:

```jsonc
{
  "simpleTodo.overrideLanguagesToCheck": [
    // Defaults
    "ts",
    "js",
    "html",
    "bat",
    "c",
    "cpp",
    "cs",
    "go",
    "java",
    "lua",
    "php",
    "yaml",
    "py",
    "swift",
    "dart",
    "ps1",
    // Custom
    "ex", // Added because functional languages are simply superior
    "txt" // Added because we use txt files for todos
  ]
}
```

Again, note that when overriding the languages to check, that you will need to
define the defaults again if you want them to be included.

# Test and run locally

### Requirements

- Node and npm installed

### Installing

1. Clone the repository via the command line:

```
git clone https://github.com/SolomonRosemite/TypeScript-Todo.git
```

2. Install the dependencies:

```
npm install
```

3. Run and debug:

- Open the todo-list folder in VS Code.
- Navigate to the debug tab.
- Select "Launch Client" and hit run. (This will open a fresh VS Code instance
  with the extension installed)

# Tools

- Language:
<code><img height="20" align="top" src="https://raw.githubusercontent.com/github/explore/80688e429a7d4ef2fca1e82350fe8e3517d3494d/topics/typescript/typescript.png">TypeScript</code>

  <h2 align="center">
    Open Source
  </h2>
  <p align="center">
    <sub>Copyright © 2020-present, Solomon Rosemite</sub>
  </p>
  <p align="center">TypeScript-Todo <a href="https://github.com/SolomonRosemite/TypeScript-Todo/blob/master/LICENSE">is MIT licensed 💖</a>
  </p>
  <p align="center">
    <img src="https://raw.githubusercontent.com/SolomonRosemite/TypeScript-Todo/50c68aaf16bc428751cc6505dd35e12d93d960f8/todo-list/assets/icon.png" width="65">
</p>
