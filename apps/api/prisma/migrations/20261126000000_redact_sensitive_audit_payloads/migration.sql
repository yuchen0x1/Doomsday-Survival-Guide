-- 旧版审计拦截器曾把登录密码、刷新令牌和 AI 提示词写入 AuditLog.payload。
-- 新代码已停止记录这些字段；本迁移清理历史行中的敏感载荷，保留操作主体与时间。
UPDATE "AuditLog"
SET "payload" = '{"redacted": true, "reason": "historical-sensitive-payload"}'::jsonb
WHERE "path" LIKE '%/auth/%'
   OR "path" LIKE '%/ai/chat%'
   OR "path" LIKE '%/ai/identify%'
   OR "payload"::text ILIKE '%"password"%'
   OR "payload"::text ILIKE '%"refreshToken"%'
   OR "payload"::text ILIKE '%"accessToken"%';
