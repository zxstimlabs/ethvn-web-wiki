'use client';

import type { ReactNode } from 'react';
import type { BoxSpec, Pt } from '@/lib/hero/iso';
import { leftFace, toPoints } from '@/lib/hero/iso';
import { backOut, easeInOut, prog } from '@/lib/hero/timeline';
import { IsoFigure, type Step } from './figure';
import { Arrow, Box, Card, Shadow, Text, type Tone } from './parts';

/**
 * How a wallet turns the recovery phrase into accounts: the 12 words are a
 * number (BIP-39), stretched into a 512-bit seed; the seed gives one private
 * key per account number (BIP-32/44); each private key gives its public key
 * (secp256k1), and together they are the key pair; Keccak-256 of the public
 * key, last 20 bytes, is the address. Left of the dashed line stays secret,
 * right of it can be shared.
 *
 * The values are real. They come from the example phrase on the wallet page
 * (`puppy cube hole … amused`), derived at m/44'/60'/0'/0/{0,1,2} with
 * @scure/bip39, @scure/bip32, @noble/curves and @noble/hashes. The public key
 * is shown as its 64 bytes (x‖y, without the 0x04 prefix), which is what gets
 * hashed. If the phrase on the page changes, recompute all of these.
 */

const DURATION = 15;
const Y = 136;
const X = { phrase: 52, seed: 136, priv: 214, pub: 318, addr: 418 } as const;
const DIVIDER = 266;
const SHEET: BoxSpec = { w: 46, d: 34, h: 4 };
const SEED: BoxSpec = { w: 26, d: 26, h: 16 };
const KEY: BoxSpec = { w: 28, d: 28, h: 26 };
const TAG: BoxSpec = { w: 44, d: 22, h: 10 };
const CARD = { x: 290, y: Y + 82, w: 184 };
const LANE = Y - 14;

const WORDS = 'puppy cube …';
/** the words' positions in the BIP-39 list of 2048 (0 = "abandon") */
const NUMBERS = '1392 427 …';
const SEED_HEX = '0x2bd5…';
const ACCOUNTS = [
  { priv: '0xeae5…f76a', pub: '0xbd5c…e7a4', addr: '0xC833…1f65' },
  { priv: '0x879c…8af3', pub: '0xefbb…3ff0', addr: '0xA762…571B' },
  { priv: '0x169c…0f8c', pub: '0xab39…0d2a', addr: '0x2497…57cB' },
];

/** The phrase reaches the seed once; then, per account, three hops (seed → private → public → address). */
const TO_SEED = { at: 2.2, len: 0.6 };
const RUNS = [
  { hops: [4, 5.4, 7.2], len: 0.6, row: 8.2 },
  { hops: [9.8, 10.25, 10.7], len: 0.4, row: 11.2 },
  { hops: [11.8, 12.25, 12.7], len: 0.4, row: 13.2 },
];
/** the account on show switches a moment before its first hop */
const switchAt = (a: number) => (a === 0 ? 0 : RUNS[a].hops[0] - 0.2);

const STEPS: Step[] = [
  {
    at: 0,
    title: '12 từ là một con số',
    body: 'Mỗi từ là một số thứ tự trong danh sách 2.048 từ cố định, nên 12 từ thực chất ghi lại một số ngẫu nhiên. Ví trộn cụm từ qua 2.048 vòng băm thành hạt giống (seed) 512 bit.',
  },
  {
    at: 4,
    title: 'Cặp khóa',
    body: 'Từ hạt giống, ví tính ra khóa riêng tư của tài khoản 1, rồi từ khóa riêng tư tính ra khóa công khai. Khóa riêng tư dùng để ký, khóa công khai để mọi người kiểm tra chữ ký.',
  },
  {
    at: 7.2,
    title: 'Địa chỉ',
    body: 'Băm khóa công khai bằng Keccak-256, giữ 20 byte cuối, thêm 0x là có địa chỉ. Không bước nào tính ngược được, nên địa chỉ chia sẻ thoải mái.',
  },
  {
    at: 9.6,
    title: 'Một cụm từ, nhiều tài khoản',
    body: 'Đổi số thứ tự tài khoản là ra cặp khóa và địa chỉ mới, vẫn từ cùng hạt giống. Vì vậy 12 từ giữ được mọi tài khoản trong ví của bạn.',
  },
];

/** One stage: a box that pops in once its value is computed, with the value and its size above it. */
function Stage({
  x,
  spec,
  tone,
  on,
  value,
  valueClass,
  sub,
  shown = on,
  children,
}: {
  x: number;
  spec: BoxSpec;
  tone: Tone;
  /** 0..1: the value has been computed */
  on: number;
  value: ReactNode;
  valueClass: string;
  sub: ReactNode;
  /** opacity of the value text (defaults to `on`) */
  shown?: number;
  children?: ReactNode;
}) {
  const at: Pt = [x, Y];
  const lift = (1 - backOut(on)) * 10;
  return (
    <g>
      <Shadow at={at} spec={spec} />
      <g opacity={0.25 + 0.75 * on} transform={lift ? `translate(0 ${(-lift).toFixed(2)})` : undefined}>
        <Box at={at} spec={spec} tone={on > 0.5 ? tone : 'device'}>
          {children}
        </Box>
      </g>
      <Text x={x} y={Y - 66} className={valueClass} opacity={shown}>
        {value}
      </Text>
      <Text x={x} y={Y - 50} className="iso-sub" opacity={shown}>
        {sub}
      </Text>
    </g>
  );
}

/** A small sprout on the seed's top face: the keys grow from here. */
function Sprout({ grow }: { grow: number }) {
  if (grow <= 0) return null;
  const [x, y] = [X.seed, Y - SEED.h];
  return (
    <g transform={`translate(${x} ${y}) scale(${grow.toFixed(3)})`}>
      <path className="sprout-stem" d="M0 0 V-11" />
      <path className="sprout-leaf" d="M0 -6 C-3 -6 -8 -8 -9 -13 C-4 -13 -1 -10 0 -6 Z" />
      <path className="sprout-leaf" d="M0 -9 C3 -9 8 -11 9 -16 C4 -16 1 -13 0 -9 Z" />
    </g>
  );
}

function render(t: number) {
  const fade = 1 - prog(t, DURATION - 0.6, 0.6);

  // the phrase reads as words, then as the numbers the words stand for
  const asNumbers = prog(t, 1.2, 0.3);
  const seedOn = prog(t, TO_SEED.at + TO_SEED.len, 0.35);

  // which account is on show, and how far its values have got
  const a = t >= switchAt(2) ? 2 : t >= switchAt(1) ? 1 : 0;
  const run = RUNS[a];
  const acct = ACCOUNTS[a];
  const done = (s: number) => prog(t, run.hops[s] + run.len, 0.35);
  // values fade out just before the next account takes over
  const leaving = a < 2 ? 1 - prog(t, switchAt(a + 1) - 0.25, 0.25) : 1;
  const F = leftFace(X.priv, Y, KEY);

  const rows = ACCOUNTS.filter((_, i) => t >= RUNS[i].row);
  const listed = prog(t, RUNS[0].row - 0.2, 0.3);

  const lanes: { from: number; to: number; started: number; run: number }[] = [
    { from: X.phrase + 32, to: X.seed - 26, started: TO_SEED.at, run: prog(t, TO_SEED.at, TO_SEED.len) },
    ...[
      [X.seed + 26, X.priv - 28],
      [X.priv + 28, X.pub - 28],
      [X.pub + 28, X.addr - 32],
    ].map(([from, to], s) => ({ from, to, started: RUNS[0].hops[s], run: prog(t, run.hops[s], run.len) })),
  ];

  return (
    <g opacity={fade < 1 ? 0.35 + 0.65 * fade : 1}>
      {/* secret on the left, shareable on the right */}
      <path className="iso-line" d={`M${DIVIDER} 34 V${Y + 26}`} style={{ strokeDasharray: '3 4' }} />
      <Text x={(8 + DIVIDER) / 2} y={22} className="iso-note is-key">
        giữ bí mật
      </Text>
      <Text x={(DIVIDER + 472) / 2} y={22} className="iso-note is-ok">
        chia sẻ được
      </Text>

      {/* one-way arrows; a token runs along each while the next value is computed */}
      {lanes.map((l, i) => (
        <g key={i}>
          <Arrow from={[l.from, LANE]} to={[l.to, LANE]} tone={t >= l.started ? 'block' : 'lane'} />
          {l.run > 0 && l.run < 1 && (
            <circle cx={l.from + (l.to - l.from) * easeInOut(l.run)} cy={LANE} r={4} style={{ fill: 'var(--block)' }} />
          )}
        </g>
      ))}

      {/* the recovery phrase: a sheet with written lines */}
      <Shadow at={[X.phrase, Y]} spec={SHEET} />
      <Box at={[X.phrase, Y]} spec={SHEET}>
        {[8, 15, 22].map((v) => (
          <path key={v} className="vent" d={`M${X.phrase - 18 + v * 0.3} ${Y - 9 + v * 0.55} l22 -12`} />
        ))}
      </Box>
      <Text x={X.phrase} y={Y - 66} className="iso-hash is-key" opacity={1 - asNumbers}>
        {WORDS}
      </Text>
      <Text x={X.phrase} y={Y - 66} className="iso-hash is-key" opacity={asNumbers}>
        {NUMBERS}
      </Text>
      <Text x={X.phrase} y={Y - 50} className="iso-sub">
        {asNumbers > 0.5 ? '12 số' : '12 từ'}
      </Text>

      <Stage x={X.seed} spec={SEED} tone="key" on={seedOn} value={SEED_HEX} valueClass="iso-hash is-key" sub="512 bit">
        <Sprout grow={backOut(seedOn)} />
      </Stage>
      <Stage x={X.priv} spec={KEY} tone="key" on={done(0)} shown={done(0) * leaving} value={acct.priv} valueClass="iso-hash is-key" sub="256 bit">
        {/* keyhole on the left face */}
        <polygon className="rack" points={toPoints([F(12, 9), F(17, 9), F(15.8, 19), F(13.2, 19)])} />
      </Stage>
      <Stage x={X.pub} spec={KEY} tone="tx" on={done(1)} shown={done(1) * leaving} value={acct.pub} valueClass="iso-hash is-tx" sub="64 byte" />
      <Stage x={X.addr} spec={TAG} tone="final" on={done(2)} shown={done(2) * leaving} value={acct.addr} valueClass="iso-hash is-ok" sub="20 byte" />

      {/* names */}
      <Text x={X.phrase} y={Y + 38}>
        Cụm từ
      </Text>
      <Text x={X.phrase} y={Y + 52}>
        khôi phục
      </Text>
      <Text x={X.seed} y={Y + 38} opacity={0.4 + 0.6 * seedOn}>
        Hạt giống
      </Text>
      <Text x={X.priv} y={Y + 38} opacity={0.4 + 0.6 * done(0)}>
        riêng tư
      </Text>
      <Text x={X.pub} y={Y + 38} opacity={0.4 + 0.6 * done(1)}>
        công khai
      </Text>
      <Text x={X.addr} y={Y + 38} opacity={0.4 + 0.6 * done(2)}>
        Địa chỉ
      </Text>

      {/* the key pair: private on the secret side, public on the shareable side */}
      <g opacity={0.4 + 0.6 * done(1)}>
        <path className="iso-line" d={`M${X.priv - 30} ${Y + 44} v6 H${X.pub + 30} v-6`} />
        <Text x={DIVIDER} y={Y + 66}>
          {`Cặp khóa · tài khoản ${a + 1}`}
        </Text>
      </g>

      {/* the wallet's account list fills up, all from the same 12 words */}
      {rows.length > 0 && (
        <g opacity={listed}>
          <Arrow from={[X.addr, Y + 46]} to={[X.addr, CARD.y - 4]} />
          <Card
            x={CARD.x}
            y={CARD.y}
            w={CARD.w}
            title="VÍ CỦA BẠN"
            rows={rows.map((r, i) => `Tài khoản ${i + 1}  ${r.addr}`)}
            active={done(2) > 0.5 ? a : undefined}
          />
        </g>
      )}
    </g>
  );
}

export function SeedScene() {
  return (
    <IsoFigure
      title="Cụm từ khôi phục 12 từ thành hạt giống, rồi thành khóa riêng tư, khóa công khai và địa chỉ cho từng tài khoản; khóa riêng tư và cụm từ giữ bí mật, khóa công khai và địa chỉ chia sẻ được"
      viewBox="0 0 480 296"
      duration={DURATION}
      poster={13.8}
      steps={STEPS}
      render={render}
    />
  );
}
