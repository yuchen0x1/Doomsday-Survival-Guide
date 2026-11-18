# 贡献指南

使用 Node.js 和根目录 `package.json` 声明的 pnpm 版本。执行 `pnpm install --frozen-lockfile` 后，运行 `pnpm --filter @apocalypse/api prisma:generate` 生成 API 类型，再运行 `pnpm lint`、`pnpm typecheck`、`pnpm test` 和 `pnpm build`。

仓库维护分支为 `main`。外部贡献可从 fork 发起 PR，说明受影响平台、数据迁移和升级影响，并等待 CI。合并前确认本地数据格式兼容性及文档变更。发布从经过验证的 `main` 提交打标签。紧急修复沿用相同检查与补丁版本规则。

提交知识内容时提供来源、来源许可和审核状态。数据及构建流程见 [平台与维护说明](docs/MAINTENANCE.md)。安全问题请走 [私密渠道](SECURITY.md)。
