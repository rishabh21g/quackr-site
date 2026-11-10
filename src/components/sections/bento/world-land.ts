// Adapted from Arc UI StatsBand world map data (MIT, © 2026 Elia Kuratli).

/**
 * A coarse dotted world: 80 columns by 30 rows, from 168° W to 192° E and 76° N to 56° S
 * (Antarctica left out). Each row is hex, four columns per digit, most significant bit first.
 * Embedded so the map needs no network request.
 */
const ROWS = [
  "001f007f800020fc0000", "7fc0cc7f00781ffffff8", "7ffffe38c0dffffffff8", "7fff0e1003bfffffff60", "40ffcf0009bffffff0c0",
  "007fff801ffffffff880", "003fff0007fffffff000", "003ffc001c737fffec00", "003ff800181f7fff4800", "001ff0000f07ffff3000",
  "000f80001fff7fff0000", "000f00003ffb9fff0000", "000340003fffc7b80000", "0001c0003ffd82380000", "000020003ffe021c0000",
  "00001f001fff00100000", "00000fc001ff00010000", "00000fe001fe00028000", "00001ff800fc00080c00", "00000ff800fc00000200",
  "000007f800fc00003000", "000003f800fd0000fc00", "000003f000790001fe00", "000007e000780001fe00", "000007c000700001de00",
  "00000780000000000e00", "00000600000000000008", "00000600000000000020", "00000400000000000000", "00000400000000000000",
];

export const WORLD = { columns: 80, rows: 30, west: -168, east: 192, north: 76, south: -56 } as const;

/** Land cells as a flat row-major array of booleans. */
export const worldLand: boolean[] = ROWS.flatMap((row) =>
  [...row].flatMap((digit) => {
    const bits = parseInt(digit, 16);
    return [8, 4, 2, 1].map((bit) => (bits & bit) !== 0);
  }),
);

const cellOf = (lon: number, lat: number) => {
  const x = Math.floor(((((lon - WORLD.west) % 360) + 360) % 360) / (WORLD.east - WORLD.west) * WORLD.columns);
  const y = Math.floor(((WORLD.north - lat) / (WORLD.north - WORLD.south)) * WORLD.rows);
  return [Math.min(WORLD.columns - 1, Math.max(0, x)), Math.min(WORLD.rows - 1, Math.max(0, y))] as const;
};

/** Snaps a point to the nearest land cell, so a coastal city never lands in the sea. Returns the cell index. */
export function nearestLand(lon: number, lat: number) {
  const [x, y] = cellOf(lon, lat);
  let best = y * WORLD.columns + x;
  let distance = Infinity;
  for (let dy = -2; dy <= 2; dy++)
    for (let dx = -2; dx <= 2; dx++) {
      const cx = x + dx;
      const cy = y + dy;
      if (cx < 0 || cy < 0 || cx >= WORLD.columns || cy >= WORLD.rows || !worldLand[cy * WORLD.columns + cx]) continue;
      const d = dx * dx + dy * dy;
      if (d < distance) {
        distance = d;
        best = cy * WORLD.columns + cx;
      }
    }
  return best;
}
