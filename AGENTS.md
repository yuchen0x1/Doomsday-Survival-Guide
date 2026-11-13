# APOCALYPSE SURVIVAL 项目协作规则

## Git 工作流

- 远程仓库：`https://github.com/yuchen0x1/Doomsday-Survival-Guide.git`
- 唯一工作分支：`main`
- 开始修改前先运行 `git branch --show-current` 和 `git status --short --branch`。
- 后续项目修改默认直接更新到 `main`；不要创建、切换或保留功能分支，除非用户明确要求。
- 不执行 `git reset --hard`、强制推送或覆盖用户未提交修改。
- 分支清理前先列出本地和远程分支，保留 `main`；删除其他分支前必须确认它们不是用户仍在使用的工作。
- 如果当前目录无法读取有效 `.git` 元数据，先报告并恢复真实仓库，再进行分支切换、合并、删除或推送；不要用 `git init` 覆盖现有工作区历史。

## 当前仓库状态说明

2026-11-12 检查时，GitHub 远程只存在 `main`，没有其他远程分支或未合并 Pull Request。当前同步盘工作区的 `.git` 是 Microsoft 云同步占位点，不能读取本地分支和提交状态。

2026-11-13：本地 Git 已从远程 main 的真实历史恢复（HEAD b0ba6ddf47c4f74e326161c62e268378e77b7205）。`.git` 现在指向 `.evolution/repository.git`，原占位目录保留为 `.git-cloud-placeholder-20261113`。恢复没有 checkout 或覆盖工作文件；大量既有修改和 API/桌面文件缺失仍保留。上述两个本地恢复目录必须一同保留，不要误删。
