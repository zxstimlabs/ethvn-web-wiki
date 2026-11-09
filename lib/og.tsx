import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { appName } from './shared';

/**
 * Share images (Open Graph / Twitter) for every page, 1200 × 630, rendered at
 * build time. The docs pages get theirs from the Fumadocs OG route
 * (`app/og/tai-lieu/...`), the home page from `app/og/home/image.png`.
 *
 * Text is set in JetBrains Mono, the site's only font. The image renderer
 * (Satori) needs font files it can read, so the latin and Vietnamese subsets
 * come from @fontsource/jetbrains-mono. Each subset is registered as its own
 * family and both are listed in `fontFamily`: Satori then matches the weight
 * inside each family. (With one shared name, a missing glyph fell back to
 * whichever weight came first, so bold titles had regular Vietnamese letters.)
 */

export const OG_SIZE = { width: 1200, height: 630 } as const;

const FONT_DIR = join(process.cwd(), 'node_modules/@fontsource/jetbrains-mono/files');
let fonts: Promise<{ name: string; data: Buffer; weight: 400 | 700; style: 'normal' }[]> | undefined;

function loadFonts() {
  fonts ??= Promise.all(
    (['latin', 'vietnamese'] as const).flatMap((subset) =>
      ([400, 700] as const).map(async (weight) => ({
        name: subset === 'latin' ? 'JBM' : 'JBM Vietnamese',
        data: await readFile(join(FONT_DIR, `jetbrains-mono-${subset}-${weight}-normal.woff`)),
        weight,
        style: 'normal' as const,
      })),
    ),
  );
  return fonts;
}

/** "#60a5fa" → "rgba(96,165,250,0.2)" (the renderer is happier with rgba than 8-digit hex). */
function alpha(hex: string, a: number) {
  const n = Number.parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
}

/** Cut text at a word boundary so it fits the space it has, with an ellipsis. */
function clip(text: string, max: number) {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  return `${cut.slice(0, cut.lastIndexOf(' ')).replace(/[,.:;]$/, '')}…`;
}

/**
 * An isometric cube (the hero's blocks), the mark until the real logo arrives, as SVG polygons.
 * A plain function, not a component: the renderer only accepts intrinsic
 * elements inside <svg>.
 */
function cube(key: string, x: number, y: number, s: number, color: string, o = 1) {
  const c = 0.866 * s;
  const top = `${x},${y - s} ${x + c},${y - s / 2} ${x},${y} ${x - c},${y - s / 2}`;
  const left = `${x - c},${y - s / 2} ${x},${y} ${x},${y + s} ${x - c},${y + s / 2}`;
  const right = `${x},${y} ${x + c},${y - s / 2} ${x + c},${y + s / 2} ${x},${y + s}`;
  return [
    <polygon key={`${key}l`} points={left} fill={alpha(color, 0.22 * o)} stroke={alpha(color, o)} strokeWidth={2} strokeLinejoin="round" />,
    <polygon key={`${key}r`} points={right} fill={alpha(color, 0.12 * o)} stroke={alpha(color, o)} strokeWidth={2} strokeLinejoin="round" />,
    <polygon key={`${key}t`} points={top} fill={alpha(color, 0.35 * o)} stroke={alpha(color, o)} strokeWidth={2} strokeLinejoin="round" />,
  ];
}

export interface OgContent {
  /** small line above the title, e.g. "Căn bản · Cách hoạt động" */
  eyebrow?: string;
  title: string;
  description?: string;
  /** accent colour (the section's), for the label above the title */
  color?: string;
}

export async function renderOgImage({ eyebrow, title, description, color = '#a78bfa' }: OgContent) {
  // One line when it fits at a readable size (monospace: 0.6 em per character), otherwise two lines at 60 px.
  const oneLine = Math.floor(1040 / (0.6 * title.length));
  const titleSize = oneLine >= 56 ? Math.min(80, oneLine) : 60;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          padding: '60px 72px',
          backgroundColor: '#0b0b0c',
          color: '#fafafa',
          fontFamily: 'JBM, JBM Vietnamese',
        }}
      >
        {/* faint isometric grid, as behind the home animation */}
        <svg width="1200" height="630" style={{ position: 'absolute', left: 0, top: 0 }}>
          {Array.from({ length: 16 }, (_, i) => (
            <line key={`a${i}`} x1={i * 140 - 600} y1={0} x2={i * 140 - 600 + 1091} y2={630} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
          ))}
          {Array.from({ length: 16 }, (_, i) => (
            <line key={`b${i}`} x1={i * 140} y1={0} x2={i * 140 - 1091} y2={630} stroke="rgba(255,255,255,0.05)" strokeWidth={1} />
          ))}
        </svg>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <svg width="44" height="48" viewBox="0 0 44 48">
            {cube('logo', 22, 20, 20, '#a78bfa')}
          </svg>
          <span style={{ fontSize: 30, fontWeight: 700, letterSpacing: '-0.01em' }}>{appName}</span>
        </div>

        {eyebrow && (
          <div style={{ display: 'flex', marginTop: 64, fontSize: 24, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color }}>
            {eyebrow}
          </div>
        )}
        <div style={{ display: 'flex', marginTop: eyebrow ? 18 : 72, maxWidth: 1040, fontSize: titleSize, fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.02em' }}>
          {clip(title, 80)}
        </div>
        {description && (
          <div style={{ display: 'flex', marginTop: 26, maxWidth: 1000, fontSize: 27, lineHeight: 1.5, color: '#a1a1aa' }}>
            {clip(description, 200)}
          </div>
        )}

      </div>
    ),
    { ...OG_SIZE, fonts: await loadFonts() },
  );
}
