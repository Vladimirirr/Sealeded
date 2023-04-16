# 我的 VSCode 配置

## 设置

```json
{
  "workbench.iconTheme": "material-icon-theme",
  "workbench.sideBar.location": "right",
  "editor.fontSize": 18,
  "editor.tabSize": 2,
  "editor.fontFamily": "JetBrains Mono, Microsoft YaHei UI",
  "editor.fontLigatures": true,
  "editor.minimap.enabled": false,
  "editor.suggest.snippetsPreventQuickSuggestions": false,
  "editor.bracketPairColorization.enabled": true,
  "editor.guides.bracketPairs": "active",
  "editor.wordWrap": "on",
  "editor.linkedEditing": true,
  "editor.unicodeHighlight.allowedLocales": {
    "zh-hans": true,
    "zh-hant": true
  },
  "editor.formatOnSave": true,
  "git.autofetch": true,
  "git.autofetchPeriod": 120,
  "gitlens.views.commits.avatars": false,
  "gitlens.views.branches.avatars": false,
  "gitlens.views.branches.branches.layout": "list",
  "update.mode": "manual",
  "security.workspace.trust.enabled": false,
  "extensions.autoUpdate": false
}
```

## 快捷键

```json
[
  {
    "key": "ctrl+d",
    "command": "editor.action.copyLinesDownAction",
    "when": "editorTextFocus && !editorReadonly"
  },
  {
    "key": "shift+alt+down",
    "command": "-editor.action.copyLinesDownAction",
    "when": "editorTextFocus && !editorReadonly"
  },
  {
    "key": "ctrl+shift+d",
    "command": "editor.action.deleteLines",
    "when": "textInputFocus && !editorReadonly"
  },
  {
    "key": "ctrl+shift+k",
    "command": "-editor.action.deleteLines",
    "when": "textInputFocus && !editorReadonly"
  },
  {
    "key": "ctrl+w",
    "command": "editor.action.addSelectionToNextFindMatch",
    "when": "editorFocus"
  },
  {
    "key": "ctrl+d",
    "command": "-editor.action.addSelectionToNextFindMatch",
    "when": "editorFocus"
  },
  {
    "key": "ctrl+shift+z",
    "command": "redo"
  },
  {
    "key": "ctrl+y",
    "command": "-redo"
  },
  {
    "key": "ctrl+k ctrl+s",
    "command": "workbench.action.files.saveAll"
  }
]
```

## 插件

- Git 管理 `eamodio.gitlens`
- Git 查看 `mhutchie.git-graph`
- Markdown 预览 `shd101wyy.markdown-preview-enhanced`
- 文件图标 `PKief.material-icon-theme`
- 代码美化 `esbenp.prettier-vscode`
- Vue 代码提示 `Vue.volar`
- 快速 Open 一个本地 Server `ritwickdey.LiveServer`

## 主题（喜好程度）

1. Dark+ (using currently)
2. Monokai
3. One Dark
4. Solarized Dark
5. One Light
6. Solarized Light

## 代码补全 (Code Snippets)

```json
{
  "SwitchStatement": {
    "scope": "javascript, typescript",
    "prefix": "switchs",
    "body": ["switch ($1) {", "  case $2:", "    $0", "  break", "}"],
    "description": "A Switch Statement."
  },
  "ConsolePrint": {
    "prefix": "clog",
    "body": ["console.log($1)"],
    "description": "Print Log on Console."
  },
  "ArrowFunction": {
    "prefix": "def",
    "body": ["($1) => "],
    "description": "An Arrow Function."
  }
}
```
