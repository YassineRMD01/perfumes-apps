/** Small color helpers used to derive a full 50–950 palette from a single accent color. */

const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));

function hexToRgb(hex: string): [number, number, number] {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h.slice(0, 6), 16);
  return Number.isNaN(n) ? [207, 125, 120] : [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const rgbToHex = (r: number, g: number, b: number) => '#' + [r, g, b].map((v) => clamp(v).toString(16).padStart(2, '0')).join('');

function mix(hex: string, target: [number, number, number], amount: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r + (target[0] - r) * amount, g + (target[1] - g) * amount, b + (target[2] - b) * amount);
}

export const SHADES = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
export type Palette = Record<(typeof SHADES)[number], string>;

/** The given color becomes shade 500; lighter shades mix with white, darker with a warm near-black. */
export function generatePalette(base: string): Palette {
  const white: [number, number, number] = [255, 255, 255];
  const black: [number, number, number] = [24, 16, 16];
  return {
    50: mix(base, white, 0.93),
    100: mix(base, white, 0.85),
    200: mix(base, white, 0.7),
    300: mix(base, white, 0.5),
    400: mix(base, white, 0.25),
    500: mix(base, white, 0),
    600: mix(base, black, 0.16),
    700: mix(base, black, 0.33),
    800: mix(base, black, 0.5),
    900: mix(base, black, 0.63),
    950: mix(base, black, 0.78),
  };
}

export const isHexColor = (v: string) => /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(v.trim());
