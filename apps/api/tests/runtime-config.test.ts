import { describe, expect, it } from 'vitest';
import {
  allowAnyCorsOrigin,
  parseCorsOrigins,
  parseTrustProxy,
  swaggerEnabled,
} from '../src/config/runtime-config';

describe('运行时安全配置', () => {
  it('parseCorsOrigins 去空白并过滤空项', () => {
    expect(parseCorsOrigins(' https://a.example , ,http://localhost:5173 ')).toEqual([
      'https://a.example',
      'http://localhost:5173',
    ]);
    expect(parseCorsOrigins(undefined)).toEqual([]);
    expect(parseCorsOrigins('')).toEqual([]);
  });

  it('CORS 反射任意来源仅限显式开发/测试环境', () => {
    expect(allowAnyCorsOrigin('development', 'false')).toBe(true);
    expect(allowAnyCorsOrigin('test', 'false')).toBe(true);
    expect(allowAnyCorsOrigin(undefined, 'false')).toBe(false);
    expect(allowAnyCorsOrigin('production', 'false')).toBe(false);
    expect(allowAnyCorsOrigin('production', undefined)).toBe(false);
    expect(allowAnyCorsOrigin('development', 'true')).toBe(false);
  });

  it('Swagger 仅开发/测试默认开启，可通过 ENABLE_SWAGGER 覆盖', () => {
    expect(swaggerEnabled('production', undefined)).toBe(false);
    expect(swaggerEnabled(undefined, undefined)).toBe(false);
    expect(swaggerEnabled('production', 'true')).toBe(true);
    expect(swaggerEnabled('development', undefined)).toBe(true);
    expect(swaggerEnabled('test', undefined)).toBe(true);
    expect(swaggerEnabled('development', 'false')).toBe(false);
  });

  it('TRUST_PROXY 只接受跳数或预置关键字', () => {
    expect(parseTrustProxy('1')).toBe(1);
    expect(parseTrustProxy('2')).toBe(2);
    expect(parseTrustProxy('0')).toBe(false);
    expect(parseTrustProxy('loopback')).toBe('loopback');
    expect(parseTrustProxy('loopback, linklocal')).toBe('loopback, linklocal');
    expect(parseTrustProxy('true')).toBe(false);
    expect(parseTrustProxy('1.2.3.4')).toBe(false);
    expect(parseTrustProxy(undefined)).toBe(false);
  });
});
