import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface ResourceDef {
  delegate: string;
  /** 允许写入的业务字段（不含 id / userId） */
  fields: string[];
  /** 需要从 ISO 字符串转 Date 的字段 */
  dateFields?: string[];
}

/**
 * 个人数据同步副本（服务端镜像）。
 * 语义：PUT 为整包覆盖（事务内先删后建，失败回滚），GET 返回该用户全量。
 * 所有读写都以 userId 隔离，杜绝越权。
 */
const RESOURCES: Record<string, ResourceDef> = {
  bookmarks: {
    delegate: 'bookmark',
    fields: ['kind', 'refId', 'title', 'tags', 'note', 'collection'],
    dateFields: ['createdAt'],
  },
  history: {
    delegate: 'readingHistory',
    fields: ['refId', 'kind', 'title', 'at'],
    dateFields: ['at'],
  },
  notes: {
    delegate: 'userNote',
    fields: ['title', 'body', 'tags'],
  },
  inventory: {
    delegate: 'inventoryEntry',
    fields: [
      'supplyId',
      'name',
      'category',
      'quantity',
      'unit',
      'minQuantity',
      'priority',
      'expiresAt',
      'notes',
    ],
    dateFields: ['expiresAt'],
  },
  transactions: {
    delegate: 'inventoryTransaction',
    fields: ['entryId', 'delta', 'reason', 'at'],
    dateFields: ['at'],
  },
  'quiz-records': {
    delegate: 'quizRecord',
    fields: ['questionId', 'chosenIndex', 'correct', 'at'],
    dateFields: ['at'],
  },
  'map-markers': {
    delegate: 'mapMarker',
    fields: ['kind', 'name', 'lat', 'lng', 'note', 'verified', 'private'],
  },
  'map-routes': {
    delegate: 'mapRoute',
    fields: ['name', 'points', 'distanceMeters'],
  },
  'offline-packages': {
    delegate: 'offlinePackage',
    fields: [
      'name',
      'description',
      'categorySlugs',
      'sizeBytes',
      'version',
      'status',
      'progress',
      'downloadedAt',
    ],
    dateFields: ['downloadedAt'],
  },
};

export const SYNC_RESOURCES = [...Object.keys(RESOURCES), 'profile', 'conversations'];

@Injectable()
export class SyncService {
  constructor(private readonly prisma: PrismaService) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private delegate(resource: string): any {
    const def = RESOURCES[resource];
    if (!def) {
      throw new NotFoundException({
        code: 'UNKNOWN_RESOURCE',
        message: `未知同步资源：${resource}`,
      });
    }
    return (this.prisma as unknown as Record<string, unknown>)[def.delegate];
  }

  async get(userId: string, resource: string): Promise<unknown> {
    if (resource === 'profile') {
      const profile = await this.prisma.survivalProfile.findUnique({ where: { userId } });
      return profile ? serializeDates(profile) : null;
    }
    if (resource === 'conversations') {
      const rows = await this.prisma.aIConversation.findMany({
        where: { userId },
        orderBy: { updatedAt: 'desc' },
        include: { messages: { orderBy: { createdAt: 'asc' } } },
      });
      return rows.map((row) => ({
        id: row.id,
        title: row.title,
        createdAt: row.createdAt.toISOString(),
        updatedAt: row.updatedAt.toISOString(),
        messages: row.messages.map((m) => ({
          id: m.id,
          role: m.role,
          content: m.content,
          toolCalls: m.toolCalls ?? undefined,
          toolResults: m.toolResults ?? undefined,
          createdAt: m.createdAt.toISOString(),
        })),
      }));
    }
    const delegate = this.delegate(resource);
    const rows = await delegate.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
    return rows.map((row: Record<string, unknown>) => serializeDates(row));
  }

  async put(
    userId: string,
    resource: string,
    payload: unknown,
  ): Promise<{ resource: string; count: number }> {
    const items = extractItems(resource, payload);

    if (resource === 'profile') {
      const data = sanitize(payload, [
        'displayName',
        'householdSize',
        'skills',
        'shelterPlan',
        'notes',
      ]);
      await this.prisma.survivalProfile.upsert({
        where: { userId },
        update: data,
        create: { userId, ...data },
      });
      return { resource, count: 1 };
    }

    if (resource === 'conversations') {
      const count = await this.replaceConversations(userId, items);
      return { resource, count };
    }

    const def = RESOURCES[resource];
    if (!def) {
      throw new NotFoundException({
        code: 'UNKNOWN_RESOURCE',
        message: `未知同步资源：${resource}`,
      });
    }
    const delegate = this.delegate(resource);
    const count = await this.prisma.$transaction(async (tx) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const scoped: any = (tx as unknown as Record<string, unknown>)[def.delegate];
      await scoped.deleteMany({ where: { userId } });

      let validEntryIds: Set<string> | null = null;
      if (resource === 'transactions') {
        const entries = await tx.inventoryEntry.findMany({
          where: { userId },
          select: { id: true },
        });
        validEntryIds = new Set(entries.map((e) => e.id));
      }

      let created = 0;
      for (const raw of items) {
        const item = toObject(raw);
        if (!item) continue;
        const data: Record<string, unknown> = { userId };
        for (const field of def.fields) {
          const value = item[field];
          if (value === undefined) continue;
          data[field] =
            def.dateFields?.includes(field) && value !== null ? new Date(String(value)) : value;
        }
        if (typeof item.id === 'string' && item.id) data.id = item.id;
        if (resource === 'transactions' && validEntryIds && typeof data.entryId === 'string') {
          if (!validEntryIds.has(data.entryId)) data.entryId = null;
        }
        await scoped.create({ data });
        created += 1;
      }
      return created;
    });
    return { resource, count };
  }

  private async replaceConversations(userId: string, items: unknown[]): Promise<number> {
    const conversations = items
      .map((raw) => toObject(raw))
      .filter((v): v is Record<string, unknown> => Boolean(v));
    await this.prisma.$transaction(async (tx) => {
      await tx.aIMessage.deleteMany({ where: { conversation: { userId } } });
      await tx.aIConversation.deleteMany({ where: { userId } });
      for (const item of conversations) {
        const messages = Array.isArray(item.messages)
          ? (item.messages as unknown[])
              .map((m) => toObject(m))
              .filter((m): m is Record<string, unknown> => Boolean(m))
          : [];
        await tx.aIConversation.create({
          data: {
            ...(typeof item.id === 'string' && item.id ? { id: item.id } : {}),
            userId,
            title: typeof item.title === 'string' ? item.title : '新对话',
            messages: {
              create: messages.map((m) => ({
                ...(typeof m.id === 'string' && m.id ? { id: m.id } : {}),
                role: typeof m.role === 'string' ? m.role : 'user',
                content: typeof m.content === 'string' ? m.content : '',
                toolCalls: (m.toolCalls as object | undefined) ?? undefined,
                toolResults: (m.toolResults as object | undefined) ?? undefined,
              })),
            },
          },
        });
      }
    });
    return conversations.length;
  }
}

function extractItems(resource: string, payload: unknown): unknown[] {
  if (Array.isArray(payload)) return payload;
  if (payload && typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;
    if (Array.isArray(obj.items)) return obj.items;
    if (resource === 'profile') return [obj];
  }
  throw new BadRequestException({
    code: 'INVALID_SYNC_PAYLOAD',
    message: '同步载荷必须是数组（profile 为对象）',
  });
}

function toObject(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return null;
}

function sanitize(payload: unknown, fields: string[]): Record<string, unknown> {
  const obj = toObject(payload) ?? {};
  const out: Record<string, unknown> = {};
  for (const field of fields) {
    if (obj[field] !== undefined) out[field] = obj[field];
  }
  return out;
}

function serializeDates(row: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...row };
  for (const [key, value] of Object.entries(out)) {
    if (value instanceof Date) out[key] = value.toISOString();
  }
  delete out.userId;
  return out;
}
