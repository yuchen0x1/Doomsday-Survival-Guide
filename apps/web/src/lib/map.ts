export const MAP_ZOOM = 13;
export const TILE_SIZE = 256;
export const MAX_MAP_LATITUDE = (Math.atan(Math.sinh(Math.PI)) * 180) / Math.PI;

interface Coordinates {
  lat: number;
  lng: number;
}

export function normalizeCoordinates({ lat, lng }: Coordinates): Coordinates {
  return {
    lat: Math.max(-MAX_MAP_LATITUDE, Math.min(MAX_MAP_LATITUDE, lat)),
    lng: ((((lng + 180) % 360) + 360) % 360) - 180,
  };
}

function worldPoint(coordinates: Coordinates) {
  const { lat, lng } = normalizeCoordinates(coordinates);
  const size = 2 ** MAP_ZOOM * TILE_SIZE;
  const radians = (lat * Math.PI) / 180;
  return {
    x: ((lng + 180) / 360) * size,
    y: Math.max(0, Math.min(size, ((1 - Math.asinh(Math.tan(radians)) / Math.PI) / 2) * size)),
  };
}

/** Tile origins, markers and click coordinates share the exact same pixel center. */
export function mapTiles(center: Coordinates) {
  const point = worldPoint(center);
  const count = 2 ** MAP_ZOOM;
  const cx = Math.floor(point.x / TILE_SIZE);
  const cy = Math.floor(point.y / TILE_SIZE);
  const tiles: { x: number; y: number; left: number; top: number }[] = [];
  for (let dy = -2; dy <= 2; dy++) {
    for (let dx = -3; dx <= 3; dx++) {
      const x = cx + dx;
      const y = cy + dy;
      if (y < 0 || y >= count) continue;
      tiles.push({
        x: ((x % count) + count) % count,
        y,
        left: x * TILE_SIZE - point.x,
        top: y * TILE_SIZE - point.y,
      });
    }
  }
  return tiles;
}

export function projectOffset(center: Coordinates, coordinates: Coordinates) {
  const origin = worldPoint(center);
  const point = worldPoint(coordinates);
  const size = 2 ** MAP_ZOOM * TILE_SIZE;
  return {
    px: ((((point.x - origin.x + size / 2) % size) + size) % size) - size / 2,
    py: point.y - origin.y,
  };
}

export function unprojectOffset(center: Coordinates, px: number, py: number): Coordinates {
  const origin = worldPoint(center);
  const size = 2 ** MAP_ZOOM * TILE_SIZE;
  const y = Math.max(0, Math.min(size, origin.y + py));
  return normalizeCoordinates({
    lat: (Math.atan(Math.sinh(Math.PI - (2 * Math.PI * y) / size)) * 180) / Math.PI,
    lng: ((origin.x + px) / size) * 360 - 180,
  });
}
