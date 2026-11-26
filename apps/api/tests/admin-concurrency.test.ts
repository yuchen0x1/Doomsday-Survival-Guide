import 'reflect-metadata';
import { ConflictException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { AdminService } from '../src/admin/admin.service';

const actor = { sub: 'admin', email: 'admin@example.com', role: 'ADMIN' as const };

function makeService(status: string, concurrentChange = false) {
  let row = {
    id: 'article',
    title: '装备清单',
    summary: '基础装备清单',
    categorySlug: 'basics',
    reviewStatus: status,
    version: 1,
    sourceIds: ['source'],
    tags: [],
    aiGenerated: false,
    dangerLevel: 'L0',
    reviewedAt: null,
    reviewedBy: null,
    reviewNote: null,
    createdAt: new Date('2026-11-01T00:00:00Z'),
    updatedAt: new Date('2026-11-01T00:00:00Z'),
  };
  const update = vi.fn(async ({ where, data }) => {
    if (where.version !== row.version || where.reviewStatus !== row.reviewStatus) {
      throw { code: 'P2025' };
    }
    row = { ...row, ...data, version: row.version + 1 };
    return row;
  });
  const reviewCreate = vi.fn(async () => ({}));
  const auditCreate = vi.fn(async () => ({}));
  const prisma = {
    article: { findUnique: async () => ({ ...row }) },
    source: {
      findMany: async () => [
        {
          id: 'source',
          name: '装备资料',
          type: 'manual',
          credibility: 'B',
          url: null,
          publisher: null,
          publishedAt: null,
          verifiedAt: null,
          verifiedBy: null,
        },
      ],
    },
    auditLog: { create: auditCreate },
    $transaction: async (callback: (tx: unknown) => Promise<unknown>) => {
      if (concurrentChange) {
        row = { ...row, reviewStatus: status === 'draft' ? 'published' : 'draft', version: 2 };
      }
      return callback({ article: { update }, reviewRecord: { create: reviewCreate } });
    },
  };
  return {
    service: new AdminService(prisma as never),
    update,
    reviewCreate,
    auditCreate,
    current: () => row,
  };
}

describe('管理员内容并发控制', () => {
  it('发布前若内容已被编辑退回草稿，拒绝用旧审核结果发布', async () => {
    const { service, update, reviewCreate, auditCreate, current } = makeService('reviewed', true);
    await expect(
      service.transition('articles', 'article', { status: 'published' }, actor),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(update.mock.calls[0][0].where).toEqual({
      id: 'article',
      version: 1,
      reviewStatus: 'reviewed',
    });
    expect(current().reviewStatus).toBe('draft');
    expect(reviewCreate).not.toHaveBeenCalled();
    expect(auditCreate).not.toHaveBeenCalled();
  });

  it('编辑草稿时若状态已改变，拒绝保留新状态并写入未经审核的内容', async () => {
    const { service, update, current } = makeService('draft', true);
    await expect(
      service.update('articles', 'article', { title: '修改后的装备清单' }, actor),
    ).rejects.toBeInstanceOf(ConflictException);
    expect(update.mock.calls[0][0].where).toEqual({
      id: 'article',
      version: 1,
      reviewStatus: 'draft',
    });
    expect(current().title).toBe('装备清单');
  });

  it('内容未改变时仍可发布并写入审核记录', async () => {
    const { service, reviewCreate, current } = makeService('reviewed');
    await service.transition('articles', 'article', { status: 'published' }, actor);
    expect(current().reviewStatus).toBe('published');
    expect(current().version).toBe(2);
    expect(reviewCreate).toHaveBeenCalledOnce();
  });

  it('修改已发布内容仍退回草稿并清除审核结论', async () => {
    const { service, current, reviewCreate } = makeService('published');
    await service.update('articles', 'article', { title: '修改后的装备清单' }, actor);
    expect(current()).toMatchObject({
      title: '修改后的装备清单',
      reviewStatus: 'draft',
      reviewedAt: null,
      reviewedBy: null,
      version: 2,
    });
    expect(reviewCreate).toHaveBeenCalledOnce();
  });
});
