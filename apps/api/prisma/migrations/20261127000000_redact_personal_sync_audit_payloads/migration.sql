-- 个人同步数据仅应保存在用户隔离的业务表，不应在管理员审计日志中额外复制。
-- 保留操作主体、资源路径和时间，仅删除历史同步请求的详细载荷。
UPDATE "AuditLog"
SET "payload" = '{"redacted": true, "reason": "historical-personal-data"}'::jsonb
WHERE "path" ~ '(^|/)sync(/|$)'
  AND "payload" IS NOT NULL;
