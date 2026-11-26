const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');
const { createRequire } = require('node:module');
const { resolve } = require('node:path');
const { setTimeout: delay } = require('node:timers/promises');

const base = process.env.SMOKE_API_URL || 'http://127.0.0.1:3100/api';
let stage = 'environment';

function requireIsolatedDatabase() {
  let api;
  let database;
  try {
    api = new URL(base);
    database = new URL(process.env.DATABASE_URL);
  } catch {
    throw new Error('Smoke checks require explicit loopback API and CI database URLs');
  }
  const loopback = new Set(['localhost', '127.0.0.1', '[::1]']);
  assert.ok(api.protocol === 'http:' && loopback.has(api.hostname), 'API must be loopback HTTP');
  assert.ok(
    ['postgres:', 'postgresql:'].includes(database.protocol) &&
      loopback.has(database.hostname) &&
      database.pathname === '/survival_ci',
    'Database must be the dedicated loopback survival_ci database',
  );
}

async function request(path, { method = 'GET', body, accessToken } = {}) {
  return fetch(`${base}${path}`, {
    method,
    headers: {
      ...(body === undefined ? {} : { 'Content-Type': 'application/json' }),
      ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
    },
    body: body === undefined ? undefined : JSON.stringify(body),
    signal: AbortSignal.timeout(5000),
  });
}

function deferred() {
  let release;
  const promise = new Promise((resolvePromise) => {
    release = resolvePromise;
  });
  return { promise, release };
}

async function expectContentConflict(prisma, AdminService, pause, intervene) {
  const entered = deferred();
  const released = deferred();
  const service = new AdminService({
    article: prisma.article,
    source: prisma.source,
    auditLog: prisma.auditLog,
    $transaction: async (...args) => {
      // Pause after the service reads its snapshot, before the real PostgreSQL transaction.
      entered.release();
      await released.promise;
      return prisma.$transaction(...args);
    },
  });
  const pending = pause(service).then(
    () => ({ succeeded: true }),
    (error) => ({ error }),
  );
  let timer;
  try {
    await Promise.race([
      entered.promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('Content snapshot barrier timed out')), 5000);
      }),
    ]);
    await intervene();
  } finally {
    clearTimeout(timer);
    released.release();
  }
  const result = await pending;
  assert.equal(result.error?.getStatus?.(), 409, 'Stale content write must fail with 409');
  assert.equal(result.error?.getResponse?.().code, 'CONTENT_CHANGED');
}

async function verifySync(prisma, user, accessToken) {
  const put = (resource, body) =>
    request(`/sync/${resource}`, { method: 'PUT', accessToken, body });
  const get = async (resource) => {
    const response = await request(`/sync/${resource}`, { accessToken });
    assert.equal(response.status, 200, `Read ${resource}`);
    return response.json();
  };
  const checkpoint = { displayName: 'CI', householdSize: 2 };
  assert.equal((await put('profile', checkpoint)).status, 200);
  assert.equal((await put('profile', [])).status, 400);
  assert.equal((await get('profile')).householdSize, checkpoint.householdSize);

  const note = { id: `smoke-note-${randomUUID()}`, title: 'CI note', body: 'CI private note' };
  assert.equal((await put('notes', [note])).status, 200);
  assert.equal((await put('notes', [null])).status, 400);
  const notes = await get('notes');
  assert.equal(notes.length, 1);
  assert.ok(notes[0].id === note.id && notes[0].body === note.body, 'Existing note must survive');

  const conversation = {
    title: 'CI conversation',
    messages: [{ role: 'user', content: 'CI private message' }],
  };
  assert.equal((await put('conversations', [conversation])).status, 200);
  assert.equal((await put('conversations', [{ messages: [null] }])).status, 400);
  const conversations = await get('conversations');
  assert.equal(conversations.length, 1);
  assert.equal(conversations[0].messages.length, 1);
  assert.ok(
    conversations[0].messages[0].content === conversation.messages[0].content,
    'Existing conversation must survive',
  );

  // Audit writes are deliberately asynchronous; wait for their commits, not a fixed race delay.
  let logs = [];
  for (let attempt = 0; attempt < 50; attempt += 1) {
    logs = await prisma.auditLog.findMany({
      where: { userId: user.id, path: { startsWith: '/api/sync/' } },
      select: { payload: true },
    });
    if (logs.length >= 6) break;
    await delay(100);
  }
  assert.equal(logs.length, 6, 'Successful and rejected sync requests must be audited');
  for (const log of logs) {
    assert.deepEqual(log.payload, { redacted: true, reason: 'personal-data' });
  }
}

async function verifyContentConcurrency(
  prisma,
  AdminService,
  user,
  accessToken,
  articleId,
  sourceId,
) {
  await prisma.user.update({ where: { id: user.id }, data: { role: 'ADMIN' } });
  await prisma.source.create({
    data: { id: sourceId, name: 'CI source', type: 'manual', credibility: 'B' },
  });
  await prisma.article.create({
    data: {
      id: articleId,
      title: 'Equipment checklist',
      summary: 'A basic equipment checklist',
      categorySlug: 'basics',
      sections: [],
      reviewStatus: 'reviewed',
      sourceIds: [sourceId],
    },
  });
  const actor = { sub: user.id, email: user.email, role: 'ADMIN' };
  const path = `/admin/content/articles/${articleId}`;
  await expectContentConflict(
    prisma,
    AdminService,
    (service) => service.transition('articles', articleId, { status: 'published' }, actor),
    async () => {
      const response = await request(path, {
        method: 'PATCH',
        accessToken,
        body: { title: 'Revised equipment checklist' },
      });
      assert.equal(response.status, 200, 'Concurrent HTTP edit');
    },
  );
  let article = await prisma.article.findUniqueOrThrow({ where: { id: articleId } });
  assert.equal(article.reviewStatus, 'draft', 'Concurrent edit must invalidate review');
  assert.equal(article.version, 2);
  assert.equal(
    await prisma.reviewRecord.count({ where: { contentId: articleId, toStatus: 'published' } }),
    0,
    'Failed stale publication must not leave a publication record',
  );

  await expectContentConflict(
    prisma,
    AdminService,
    (service) => service.update('articles', articleId, { title: 'Stale draft edit' }, actor),
    async () => {
      for (const status of ['pending_review', 'reviewed', 'published']) {
        const response = await request(`${path}/status`, {
          method: 'POST',
          accessToken,
          body: { status },
        });
        assert.equal(response.status, 201, `Concurrent HTTP review ${status}`);
      }
    },
  );
  article = await prisma.article.findUniqueOrThrow({ where: { id: articleId } });
  assert.equal(article.reviewStatus, 'published');
  assert.equal(article.title, 'Revised equipment checklist', 'Stale draft edit must not be saved');
  assert.equal(article.version, 5);
  assert.equal(
    await prisma.reviewRecord.count({ where: { contentId: articleId, toStatus: 'published' } }),
    1,
  );
}

async function exercise(prisma, AdminService, cleanup) {
  stage = 'health';
  const health = await request('/health');
  assert.equal(health.status, 200);
  assert.equal((await health.json()).db, 'up');

  stage = 'authentication';
  assert.equal((await request('/auth/me')).status, 401);
  const registered = await request('/auth/register', {
    method: 'POST',
    body: { email: `smoke-${randomUUID()}@example.com`, password: randomUUID() },
  });
  assert.equal(registered.status, 201);
  const { user, tokens } = await registered.json();
  cleanup.userId = user.id;
  const me = await request('/auth/me', { accessToken: tokens.accessToken });
  assert.equal(me.status, 200);
  assert.equal((await me.json()).id, user.id);

  // A duplicate submission must leave only one usable successor.
  const refresh = (refreshToken) =>
    request('/auth/refresh', { method: 'POST', body: { refreshToken } });
  const results = await Promise.all([refresh(tokens.refreshToken), refresh(tokens.refreshToken)]);
  assert.deepEqual(results.map(({ status }) => status).sort(), [201, 401]);
  const accepted = results.find(({ status }) => status === 201);
  const replacement = (await accepted.json()).tokens;
  assert.ok(replacement.refreshToken !== tokens.refreshToken, 'Refresh token must rotate');
  const rotated = await refresh(replacement.refreshToken);
  assert.equal(rotated.status, 201);

  stage = 'sync preservation and audit privacy';
  await verifySync(prisma, user, replacement.accessToken);
  stage = 'PostgreSQL content concurrency';
  await verifyContentConcurrency(
    prisma,
    AdminService,
    user,
    replacement.accessToken,
    cleanup.articleId,
    cleanup.sourceId,
  );
}

async function main() {
  requireIsolatedDatabase();
  const apiRequire = createRequire(resolve(__dirname, '../apps/api/package.json'));
  apiRequire('reflect-metadata');
  const { PrismaClient } = apiRequire('@prisma/client');
  const { AdminService } = require('../apps/api/dist/apps/api/src/admin/admin.service.js');
  const prisma = new PrismaClient();
  const cleanup = {
    userId: null,
    articleId: `smoke-article-${randomUUID()}`,
    sourceId: `smoke-source-${randomUUID()}`,
  };
  try {
    await exercise(prisma, AdminService, cleanup);
  } finally {
    try {
      await prisma.reviewRecord.deleteMany({ where: { contentId: cleanup.articleId } });
      await prisma.contentTag.deleteMany({ where: { contentId: cleanup.articleId } });
      await prisma.article.deleteMany({ where: { id: cleanup.articleId } });
      await prisma.source.deleteMany({ where: { id: cleanup.sourceId } });
      if (cleanup.userId) {
        await prisma.auditLog.deleteMany({ where: { userId: cleanup.userId } });
        await prisma.user.deleteMany({ where: { id: cleanup.userId } });
      }
    } finally {
      await prisma.$disconnect();
    }
  }
  console.log(
    'PASS: PostgreSQL health/auth/refresh, sync preservation/privacy and content concurrency',
  );
}

main().catch((error) => {
  // Never print tokens, request bodies, database URLs or Prisma error details.
  console.error(`FAIL: API smoke at ${stage} (${error?.name || 'Error'})`);
  process.exitCode = 1;
});
