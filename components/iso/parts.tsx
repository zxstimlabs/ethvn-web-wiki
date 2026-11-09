import type { ReactNode } from 'react';
import { type BoxSpec, type Pt, boxFaces, leftFace, rightFace, shadow, toPath, toPoints } from '@/lib/hero/iso';

/**
 * Drawing primitives for the wiki's isometric explainers. Same projection and
 * face styles as the home hero (lib/hero/iso.ts, block-scene.css).
 */

export type Tone = 'device' | 'block' | 'final' | 'tx' | 'bad' | 'key' | 'l2' | 'mine';
export type LineTone = 'lane' | 'block' | 'tx' | 'ok' | 'key' | 'l2' | 'bad';

export function Box({
  at,
  spec,
  tone = 'device',
  opacity,
  children,
}: {
  at: Pt;
  spec: BoxSpec;
  tone?: Tone;
  opacity?: number;
  children?: ReactNode;
}) {
  const f = boxFaces(at[0], at[1], spec);
  return (
    <g className={`tone-${tone}`} opacity={opacity}>
      <polygon className="f-left" points={toPoints(f.left)} />
      <polygon className="f-right" points={toPoints(f.right)} />
      <polygon className="f-top" points={toPoints(f.top)} />
      {children}
    </g>
  );
}

export function Shadow({ at, spec, opacity }: { at: Pt; spec: BoxSpec; opacity?: number }) {
  return <polygon className="shade" points={shadow(at[0], at[1], spec)} opacity={opacity} />;
}

/** A chain block: a box with the hero's horizontal stripes. */
export function Cube({ at, spec, tone = 'block', opacity }: { at: Pt; spec: BoxSpec; tone?: Tone; opacity?: number }) {
  const L = leftFace(at[0], at[1], spec);
  const R = rightFace(at[0], at[1], spec);
  const stripes: string[] = [];
  for (let k = 1; k < 5; k++) {
    const v = (spec.z ?? 0) + (k * spec.h) / 5;
    stripes.push(toPath([L(0, v), L(spec.w, v)]), toPath([R(0, v), R(spec.d, v)]));
  }
  return (
    <Box at={at} spec={spec} tone={tone} opacity={opacity}>
      <path className="stripe" d={stripes.join(' ')} />
    </Box>
  );
}

/** A node (computer): a tower with two rack slots on its left face. */
export function Server({ at, spec = { w: 26, d: 26, h: 34 }, opacity }: { at: Pt; spec?: BoxSpec; opacity?: number }) {
  const F = leftFace(at[0], at[1], spec);
  const slot = (v: number): Pt[] => [F(4, v), F(spec.w - 4, v), F(spec.w - 4, v + 6), F(4, v + 6)];
  return (
    <g opacity={opacity}>
      <Shadow at={at} spec={spec} />
      <Box at={at} spec={spec}>
        <polygon className="rack" points={toPoints(slot(8))} />
        <polygon className="rack" points={toPoints(slot(19))} />
      </Box>
    </g>
  );
}

/** A phone standing on the ground, screen on its right face. */
export function Phone({ at, lit = false, opacity }: { at: Pt; lit?: boolean; opacity?: number }) {
  const spec: BoxSpec = { w: 6, d: 24, h: 40 };
  const R = rightFace(at[0], at[1], spec);
  return (
    <g className="wallet" data-send={String(lit)} opacity={opacity}>
      <Shadow at={at} spec={spec} />
      <Box at={at} spec={spec}>
        <polygon className="screen" points={toPoints([R(2.5, 5), R(spec.d - 2.5, 5), R(spec.d - 2.5, spec.h - 5), R(2.5, spec.h - 5)])} />
      </Box>
    </g>
  );
}

export function Text({
  x,
  y,
  children,
  className = 'iso-lbl',
  anchor = 'middle',
  opacity,
}: {
  x: number;
  y: number;
  children: ReactNode;
  className?: string;
  anchor?: 'start' | 'middle' | 'end';
  opacity?: number;
}) {
  return (
    <text x={x} y={y} textAnchor={anchor} className={className} opacity={opacity}>
      {children}
    </text>
  );
}

/** A straight line with an arrowhead at `to`; `k` (0..1) draws it partially. */
export function Arrow({
  from,
  to,
  tone = 'lane',
  k = 1,
  head = true,
  opacity,
}: {
  from: Pt;
  to: Pt;
  tone?: LineTone;
  k?: number;
  head?: boolean;
  opacity?: number;
}) {
  if (k <= 0) return null;
  const end: Pt = [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k];
  const a = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const s = 6;
  const tip = (r: number, da: number): Pt => [end[0] - r * Math.cos(a + da), end[1] - r * Math.sin(a + da)];
  return (
    <g opacity={opacity}>
      <path className="iso-line" data-tone={tone} d={toPath([from, head ? tip(s * 0.6, 0) : end])} />
      {head && <path className="iso-head" data-tone={tone} d={`${toPath([end, tip(s, 0.45), tip(s, -0.45)])} Z`} />}
    </g>
  );
}

/** A round ✓ or ✗ badge. */
export function Badge({ at, ok, r = 8, scale = 1, opacity }: { at: Pt; ok: boolean; r?: number; scale?: number; opacity?: number }) {
  if (scale <= 0 || opacity === 0) return null;
  const q = r * 0.42;
  return (
    <g transform={`translate(${at[0]} ${at[1]}) scale(${scale.toFixed(3)})`} opacity={opacity}>
      <circle className={ok ? 'badge-ok' : 'badge-bad'} r={r} />
      <path
        className="badge-mark"
        d={ok ? `M${-q} 0 l${q * 0.7} ${q * 0.75} l${q * 1.4} ${-q * 1.45}` : `M${-q} ${-q} L${q} ${q} M${q} ${-q} L${-q} ${q}`}
      />
    </g>
  );
}

/** A flat card with a title and text rows, top-left at (x, y). */
export function Card({
  x,
  y,
  w,
  title,
  rows,
  opacity,
  highlight,
  active,
}: {
  x: number;
  y: number;
  w: number;
  title?: string;
  rows: ReactNode[];
  opacity?: number;
  /** row(s) drawn in the "wrong" colour */
  highlight?: number | number[];
  /** row(s) drawn as "look here" */
  active?: number | number[];
}) {
  const has = (v: number | number[] | undefined, i: number) => (Array.isArray(v) ? v.includes(i) : v === i);
  const top = title ? 18 : 6;
  const h = top + rows.length * 15 + 6;
  return (
    <g opacity={opacity}>
      <rect className="card" x={x} y={y} width={w} height={h} />
      {title && (
        <text className="card-title" x={x + 8} y={y + 13}>
          {title}
        </text>
      )}
      {rows.map((row, i) => (
        <text
          key={i}
          className={has(highlight, i) ? 'card-row is-bad' : has(active, i) ? 'card-row is-active' : 'card-row'}
          x={x + 8}
          y={y + top + 11 + i * 15}
        >
          {row}
        </text>
      ))}
    </g>
  );
}

/** A message in flight: a small labelled pill centred on `at`. */
export function Pill({ at, text, tone = 'lane', opacity }: { at: Pt; text: string; tone?: LineTone; opacity?: number }) {
  const w = text.length * 6.4 + 14;
  return (
    <g transform={`translate(${at[0].toFixed(1)} ${at[1].toFixed(1)})`} opacity={opacity}>
      <rect className="pill" data-tone={tone} x={-w / 2} y={-9} width={w} height={18} rx={9} />
      <text className="pill-text" data-tone={tone} y={4} textAnchor="middle">
        {text}
      </text>
    </g>
  );
}

/** A stack of `n` coins (stake), standing on the ground at `at`. */
export function Coins({ at, n, tone = 'key', opacity }: { at: Pt; n: number; tone?: Tone; opacity?: number }) {
  const coin: BoxSpec = { w: 12, d: 12, h: 3 };
  return (
    <g opacity={opacity}>
      {n > 0 && <Shadow at={at} spec={coin} />}
      {Array.from({ length: Math.max(0, Math.round(n)) }, (_, i) => (
        <Box key={i} at={at} spec={{ ...coin, z: i * 4 }} tone={tone} />
      ))}
    </g>
  );
}

/** A small flame (burned fees), base at `at`. */
export function Flame({ at, scale = 1, opacity }: { at: Pt; scale?: number; opacity?: number }) {
  return (
    <g transform={`translate(${at[0]} ${at[1]}) scale(${scale.toFixed(3)})`} opacity={opacity}>
      <path className="flame-out" d="M0 0 C-11 -2 -12 -14 -5 -22 C-5 -15 -1 -14 0 -18 C2 -24 0 -30 -2 -34 C9 -28 13 -16 10 -7 C9 -3 5 0 0 0 Z" />
      <path className="flame-in" d="M0 -2 C-5 -3 -6 -9 -2 -13 C-1 -10 1 -10 2 -13 C5 -10 5 -4 0 -2 Z" />
    </g>
  );
}
