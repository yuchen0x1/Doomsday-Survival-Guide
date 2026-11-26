/** 解析逗号分隔的 CORS 来源，忽略空白与空项。 */
export function parseCorsOrigins(raw: string | undefined): string[] {
  return (raw ?? '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

/**
 * 是否反射任意来源。
 * 仅允许显式 development/test 环境通过 ENABLE_CORS_WHITELIST=false 开启；
 * 生产环境或未声明环境始终使用 CORS_ORIGINS 白名单，避免携带凭据的跨源请求被任意站点读取。
 */
export function allowAnyCorsOrigin(
  nodeEnv: string | undefined,
  whitelistFlag: string | undefined,
): boolean {
  return (nodeEnv === 'development' || nodeEnv === 'test') && whitelistFlag === 'false';
}

/** 仅 development/test 默认开启 Swagger；ENABLE_SWAGGER 可显式覆盖，未声明环境默认关闭。 */
export function swaggerEnabled(nodeEnv: string | undefined, flag: string | undefined): boolean {
  if (flag === 'true') return true;
  if (flag === 'false') return false;
  return nodeEnv === 'development' || nodeEnv === 'test';
}

/**
 * 解析 TRUST_PROXY。仅接受代理跳数（正整数）或 Express 支持的预置关键字，
 * 避免把用户输入直接交给 proxy-addr 解析。
 */
export function parseTrustProxy(raw: string | undefined): number | string | false {
  const value = raw?.trim();
  if (!value) return false;
  if (/^\d+$/.test(value)) {
    const hops = Number(value);
    return hops > 0 ? hops : false;
  }
  const keywords = new Set(['loopback', 'linklocal', 'uniquelocal']);
  if (value.split(',').every((part) => keywords.has(part.trim()))) {
    return value;
  }
  return false;
}
