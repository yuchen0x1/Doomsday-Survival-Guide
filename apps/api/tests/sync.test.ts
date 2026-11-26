import 'reflect-metadata';
import { BadRequestException } from '@nestjs/common';
import { describe, expect, it, vi } from 'vitest';

vi.mock('../src/prisma/prisma.service', () => ({
  PrismaService: class PrismaService {},
}));

import { SyncService } from '../src/sync/sync.service';

function makeService() {
  const deleteMany = vi.fn(async () => ({ count: 1 }));
  const create = vi.fn(async () => ({}));
  const upsert = vi.fn(async () => ({}));
  const transaction = vi.fn(async (callback: (tx: unknown) => Promise<unknown>) =>
    callback({ userNote: { deleteMany, create } }),
  );
  const service = new SyncService({
    $transaction: transaction,
    survivalProfile: { upsert },
  } as never);
  return { service, deleteMany, create, upsert, transaction };
}

describe('个人数据同步载荷校验', () => {
  it.each([
    { payload: [null] },
    { payload: [1] },
    { payload: ['note'] },
    { payload: [[]] },
    { payload: { items: [null] } },
    { payload: { items: [false] } },
  ])('拒绝非对象条目，删除已有副本之前完成校验：%j', async ({ payload }) => {
    const { service, transaction } = makeService();
    await expect(service.put('user', 'notes', payload)).rejects.toBeInstanceOf(BadRequestException);
    expect(transaction).not.toHaveBeenCalled();
  });

  it('仍支持显式空数组清空与对象数组上传', async () => {
    const { service, deleteMany, create } = makeService();
    await expect(service.put('user', 'notes', [])).resolves.toEqual({
      resource: 'notes',
      count: 0,
    });
    await expect(
      service.put('user', 'notes', { items: [{ id: 'note', title: '清单', body: '内容' }] }),
    ).resolves.toEqual({ resource: 'notes', count: 1 });
    expect(deleteMany).toHaveBeenCalledWith({ where: { userId: 'user' } });
    expect(create).toHaveBeenCalledWith({
      data: { userId: 'user', id: 'note', title: '清单', body: '内容' },
    });
  });

  it('profile 必须为对象，拒绝数组而不写入空档案', async () => {
    const { service, upsert } = makeService();
    await expect(service.put('user', 'profile', [])).rejects.toBeInstanceOf(BadRequestException);
    expect(upsert).not.toHaveBeenCalled();
    await service.put('user', 'profile', { displayName: '用户', userId: 'other' });
    expect(upsert).toHaveBeenCalledWith({
      where: { userId: 'user' },
      update: { displayName: '用户' },
      create: { userId: 'user', displayName: '用户' },
    });
  });

  it('会话中的非对象条目同样在事务前拒绝', async () => {
    const { service, transaction } = makeService();
    await expect(service.put('user', 'conversations', [null])).rejects.toBeInstanceOf(
      BadRequestException,
    );
    expect(transaction).not.toHaveBeenCalled();
  });

  it.each([{ messages: [null] }, { messages: ['text'] }, { messages: {} }, { messages: null }])(
    '会话消息格式错误时保留已有会话：%j',
    async (conversation) => {
      const { service, transaction } = makeService();
      await expect(service.put('user', 'conversations', [conversation])).rejects.toBeInstanceOf(
        BadRequestException,
      );
      expect(transaction).not.toHaveBeenCalled();
    },
  );
});
