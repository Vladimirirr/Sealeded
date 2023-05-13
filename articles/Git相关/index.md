# Git 相关

**Git 官网：<https://git-scm.com/>**

**书《Pro Git》：<https://github.com/progit/progit2>**

**Git 基本操作：<http://marklodato.github.io/visual-git-guide/index-zh-cn.html>**

**Git 操作建议采取可视化工具，比如 VSCode 的 GitLens 和 GitGraph 插件，和跨平台的 SourceTree。**

## Merge 整合

### fast-forward merge

### no-ff merge

Create a merged commit.

### squash merge

与 no-ff merge 相同，只是 merged commit 仅保留一个父指针（当前的）。

### cherry-pick

重做一个或多个 commit。

### rebase

在 main 上重做 feature 的全部提交，相当自运行的 cherry-pick，使得非线性的常规 merge 变地线性化。就像 feature 不存在一样，也就是变基。

## 恢复

### reset

`reset --soft historyCommitHash`：只工作区

`reset --mixed historyCommitHash`：工作区和暂存区（默认）

`reset --hard historyCommitHash`：全部 (DANGER)

### revert

**重做**某一次有错误的提交，提交永远是向前的，不会像 `reset --hard` 一样丢失提交记录。

语法：`git revert historyCommitHash`

### restore

恢复文件：`git restore [--wroktree] [--staged] [--source fromSource] [files | .]`

- --wroktree | -W 到工作区，默认选项
- --staged | -S：到暂存区
- --source | -s：恢复自 `historyCommitHash | branchName | tagName`
- files：列表，或一个 glob 表达式，或一个 `.` 表示全部

### commity --amend

## 远端

远端：git 地址的取名

- `git remote add remoteName URL`
- `git remote remove remoteName`
- `git rename oldName newName`
- `git remote -v`
- `git remote show remoteName`
- `git remote prune origin`

## Git 的基本思想概述

两个字 “快照”。一次 commit 即一次快照。

而 SVN 是增量。
