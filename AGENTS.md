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

2026-11-26 检查：本地 `.git` 是真实 Git 元数据，当前分支 `main`，工作区包含完整的 Web、API、桌面和移动端源码。此前的 `.evolution/`、`.git-cloud-placeholder-*` 目录已不存在，无需再保留。

远程长期分支只保留 `main`。Dependabot 自动生成的分支随对应依赖 PR 存在，关闭 PR 后应删除；不要把它们当作功能分支长期保留。
