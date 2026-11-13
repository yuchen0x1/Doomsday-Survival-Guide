import { describe, expect, it } from 'vitest';
import { buildPackagePayload, computePackageSize, PACKAGE_DEFS } from '../src/lib/offline';

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
});
