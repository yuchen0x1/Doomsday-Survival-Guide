import { describe, expect, it } from 'vitest';
import {
  MAP_ZOOM,
  MAX_MAP_LATITUDE,
  mapTiles,
  normalizeCoordinates,
  projectOffset,
  TILE_SIZE,
  unprojectOffset,
} from '../src/lib/map';

describe('map coordinate alignment', () => {
  it('places tile origins relative to the actual map center, not the tile midpoint', () => {
    const center = { lat: 39.9042, lng: 116.4074 };
    const origin = mapTiles(center).find(
      (tile) => tile.left <= 0 && tile.left > -TILE_SIZE && tile.top <= 0 && tile.top > -TILE_SIZE,
    );
    expect(origin).toBeDefined();
    if (!origin) throw new Error('Center tile is missing');
    const coordinate = unprojectOffset(center, origin.left, origin.top);
    const size = 2 ** MAP_ZOOM * TILE_SIZE;
    expect(((coordinate.lng + 180) / 360) * size).toBeCloseTo(origin.x * TILE_SIZE, 6);
    const offset = projectOffset(center, coordinate);
    expect(offset.px).toBeCloseTo(origin.left, 6);
    expect(offset.py).toBeCloseTo(origin.top, 6);
  });

  it('round-trips map clicks and marker offsets', () => {
    const center = { lat: 39.9042, lng: 116.4074 };
    for (const [px, py] of [
      [0, 0],
      [370, -200],
      [-420, 220],
    ]) {
      const result = projectOffset(center, unprojectOffset(center, px, py));
      expect(result.px).toBeCloseTo(px, 6);
      expect(result.py).toBeCloseTo(py, 6);
    }
  });

  it('covers the full 1280px content width even near a tile edge', () => {
    const tiles = mapTiles({ lat: 39.9042, lng: 116.4074 });
    expect(Math.min(...tiles.map((tile) => tile.left))).toBeLessThan(-640);
    expect(Math.max(...tiles.map((tile) => tile.left + TILE_SIZE))).toBeGreaterThan(640);
  });

  it('keeps nearby markers and clicks local across the date line', () => {
    const center = { lat: 0, lng: 179.999 };
    const marker = { lat: 0, lng: -179.999 };
    const offset = projectOffset(center, marker);
    expect(offset.px).toBeGreaterThan(0);
    expect(offset.px).toBeLessThan(20);
    const restored = unprojectOffset(center, offset.px, offset.py);
    expect(restored.lng).toBeCloseTo(marker.lng, 8);
    expect(mapTiles(center).every((tile) => tile.x >= 0 && tile.x < 2 ** MAP_ZOOM)).toBe(true);
  });

  it('clamps polar coordinates and preserves tile positions when rows are clipped', () => {
    const center = normalizeCoordinates({ lat: 90, lng: 181 });
    expect(center).toEqual({ lat: MAX_MAP_LATITUDE, lng: -179 });
    const tiles = mapTiles(center);
    expect(tiles.every((tile) => Number.isFinite(tile.top) && tile.y >= 0)).toBe(true);
    const first = tiles.find((tile) => tile.y === 0);
    const second = tiles.find((tile) => tile.y === 1);
    if (!first || !second) throw new Error('Polar tile rows are missing');
    expect(second.top - first.top).toBe(TILE_SIZE);
    expect(unprojectOffset(center, 0, -500).lat).toBeLessThanOrEqual(MAX_MAP_LATITUDE);
  });
});
