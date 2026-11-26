import 'fake-indexeddb/auto';
import { IDBObjectStore } from 'fake-indexeddb';
import { afterEach, describe, expect, it, vi } from 'vitest';
import * as db from '../src/lib/db';
import {
  buildPackagePayload,
  computePackageSize,
  loadPackagePayload,
  loadPackageStates,
  PACKAGE_DEFS,
  packageEntryCount,
  updatePackage,
} from '../src/lib/offline';

afterEach(async () => {
  vi.restoreAllMocks();
  vi.useRealTimers();
  await db.clearAllData();
});

function getPackageDef(id: string) {
  const def = PACKAGE_DEFS.find((item) => item.id === id);
  if (!def) throw new Error(`Missing package definition: ${id}`);
  return def;
}

describe('offline package payloads', () => {
  it('keeps package size estimation aligned with the stored payload', () => {
    for (const def of PACKAGE_DEFS) {
      const payload = buildPackagePayload(def);
      expect(Object.keys(payload).length, def.id).toBeGreaterThan(0);
      expect(computePackageSize(def)).toBe(
        new TextEncoder().encode(JSON.stringify(payload)).length,
      );
    }
  });

  it('reports the number of real serialized entries instead of trusting metadata', () => {
    const payload = buildPackagePayload(getPackageDef('pkg-plants'));
    const expected = Object.values(payload).reduce((sum, rows) => sum + rows.length, 0);
    expect(packageEntryCount(payload)).toBe(expected);
    expect(packageEntryCount({ plants: [{ id: 'one' }, { id: 'two' }] })).toBe(2);
  });

  it('includes the datasets named by each package', () => {
    expect(buildPackagePayload(getPackageDef('pkg-plants'))).toHaveProperty('plants');
    expect(buildPackagePayload(getPackageDef('pkg-animals'))).toEqual(
      expect.objectContaining({ animals: expect.any(Array), animalTracks: expect.any(Array) }),
    );
    expect(buildPackagePayload(getPackageDef('pkg-first-aid-full'))).toEqual(
      expect.objectContaining({ firstAid: expect.any(Array), medicines: expect.any(Array) }),
    );
  });

  it('includes only quiz questions whose source is present in the downloaded package', () => {
    for (const def of PACKAGE_DEFS) {
      const payload = buildPackagePayload(def);
      const includedIds = new Set(
        Object.values(payload).flatMap((rows) =>
          rows.flatMap((row) =>
            row && typeof row === 'object' && 'id' in row && typeof row.id === 'string'
              ? [row.id]
              : [],
          ),
        ),
      );
      for (const question of payload.quizQuestions ?? []) {
        const sourceId = (question as { sourceRefId: string }).sourceRefId.split(':').at(-1);
        expect(sourceId, `${def.id} includes an unrelated quiz`).toBeDefined();
        if (sourceId) {
          expect(includedIds.has(sourceId), `${def.id} is missing quiz source ${sourceId}`).toBe(
            true,
          );
        }
      }
    }
  });

  it('uses the bundled target version when upgrading an older saved package', async () => {
    const def = getPackageDef('pkg-plants');
    await db.saveOfflinePackage({ ...def, version: '0.9.0', sizeBytes: 1, status: 'downloaded' });
    await db.setSetting(`pkgdata:${def.id}`, JSON.stringify(buildPackagePayload(def)));
    const state = (await loadPackageStates()).find((item) => item.id === def.id);
    expect(state).toMatchObject({ status: 'update_available', version: def.version });
    if (!state) throw new Error('Missing saved package');
    await updatePackage(state, () => {});
    expect((await loadPackageStates()).find((item) => item.id === def.id)).toMatchObject({
      status: 'downloaded',
      version: def.version,
    });
  });

  it('preserves the previous payload and metadata when updating metadata fails', async () => {
    const def = getPackageDef('pkg-plants');
    const oldPayload = { plants: [{ id: 'old-plant' }] };
    const oldMetadata = { ...def, version: '0.9.0', sizeBytes: 1, status: 'downloaded' as const };
    await db.saveOfflinePackage(oldMetadata);
    await db.setSetting(`pkgdata:${def.id}`, JSON.stringify(oldPayload));
    const original = IDBObjectStore.prototype.put;
    vi.spyOn(IDBObjectStore.prototype, 'put').mockImplementation(function (
      this: IDBObjectStore,
      ...args: Parameters<typeof original>
    ) {
      if (this.name === 'offlinePackages')
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      return original.apply(this, args);
    });
    await expect(updatePackage(def, () => {})).rejects.toThrow('Quota');
    expect(await loadPackagePayload(def.id)).toEqual(oldPayload);
    expect(await db.listOfflinePackages()).toEqual([oldMetadata]);
  });
});
