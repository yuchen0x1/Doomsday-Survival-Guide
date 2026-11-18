const assert = require('node:assert/strict');
const { randomUUID } = require('node:crypto');

const base = process.env.SMOKE_API_URL || 'http://127.0.0.1:3100/api';

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

async function main() {
  const health = await request('/health');
  assert.equal(health.status, 200);
  assert.equal((await health.json()).db, 'up');

  assert.equal((await request('/auth/me')).status, 401);
  const registered = await request('/auth/register', {
    method: 'POST',
    body: { email: `smoke-${randomUUID()}@example.com`, password: randomUUID() },
  });
  assert.equal(registered.status, 201);
  const { user, tokens } = await registered.json();
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
  assert.notEqual(replacement.refreshToken, tokens.refreshToken);
  const rotated = await refresh(replacement.refreshToken);
  assert.equal(rotated.status, 201);

  const checkpoint = { displayName: 'CI', householdSize: 2 };
  const putProfile = await request('/sync/profile', {
    method: 'PUT',
    accessToken: replacement.accessToken,
    body: checkpoint,
  });
  assert.equal(putProfile.status, 200);
  const profile = await request('/sync/profile', { accessToken: replacement.accessToken });
  assert.equal(profile.status, 200);
  assert.equal((await profile.json()).householdSize, checkpoint.householdSize);
  console.log('PASS: migrated PostgreSQL, health, sign-in, refresh rotation and profile sync');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
