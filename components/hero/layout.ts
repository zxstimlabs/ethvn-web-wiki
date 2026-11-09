/**
 * Where everything sits in the home hero. The same parts are composed twice:
 * `WIDE` (landscape, tablets and up) and `TALL` (portrait, phones). The scene
 * draws and the engine animates from a `Layout`, so the story and its timing
 * stay in one place and only the composition differs.
 */

import { type BoxSpec, COS30, type Pt, iso } from '@/lib/hero/iso';
import { LAYERS, VOTERS } from '@/lib/hero/timeline';

export type Frame = readonly [number, number, number, number];
export type Anchor = 'start' | 'middle' | 'end';
export type ModKey = 'rpc' | 'mempool' | 'p2p' | 'validator' | 'beacon' | 'mev';
export type LaneState = 'idle' | 'off' | 'tx' | 'block' | 'vote' | 'amber';
export type Lane = { id: string; from: Pt; to: Pt; initial: LaneState };
export interface LabelSpec {
  x: number;
  y: number;
  title: string;
  sub?: string;
  anchor?: Anchor;
}
type LabelKey = 'wallet' | 'node' | 'peers' | 'builders' | 'relay' | 'committee' | 'chain';

// ── parts that keep their size in both compositions (world px) ───────────

export const PEER: BoxSpec = { w: 24, d: 24, h: 30 };
export const BENCH: BoxSpec = { w: 44, d: 44, h: 10 };
export const TEMPLATE: BoxSpec = { w: 28, d: 28, h: 25, z: BENCH.h };
export const SLAB_H = TEMPLATE.h / LAYERS;
/** A MEV-Boost relay is a third-party node: a full node (beacon) plus the relay software. */
export const RELAY_PLATFORM: BoxSpec = { w: 50, d: 70, h: 6 };
export const RELAY_MODULE: BoxSpec = { w: 30, d: 24, h: 16, z: RELAY_PLATFORM.h };
export const RELAY_MODS = [
  { key: 'relay', y: -17, label: 'Relay', tone: 'tone-mev' },
  { key: 'beacon', y: 17, label: 'Beacon', tone: 'tone-cl' },
] as const;
export const VAL: BoxSpec = { w: 22, d: 22, h: 14 };
export const PHONE: BoxSpec = { w: 6, d: 22, h: 38 };
export const TOKEN: BoxSpec = { w: 7, d: 7, h: 7 };
export const TRAVEL_SCALE = 0.5;
/** which peer forwards the transaction to each builder */
export const BUILDER_PEER = [0, 0, 1];

/** The node: execution layer (back row) and consensus layer (front row). */
const MOD_GRID: { key: ModKey; col: -1 | 1; row: -1 | 0 | 1; label: string; tone: string }[] = [
  { key: 'rpc', col: -1, row: 1, label: 'RPC', tone: 'tone-el' },
  { key: 'mempool', col: -1, row: 0, label: 'Mempool', tone: 'tone-el' },
  { key: 'p2p', col: -1, row: -1, label: 'P2P', tone: 'tone-el' },
  { key: 'validator', col: 1, row: 1, label: 'Validator', tone: 'tone-cl' },
  { key: 'beacon', col: 1, row: 0, label: 'Beacon', tone: 'tone-cl' },
  { key: 'mev', col: 1, row: -1, label: 'MEV-Boost', tone: 'tone-mev' },
];

export const up = (p: Pt, z: number): Pt => [p[0], p[1] - z];
const mid = (a: Pt, b: Pt): Pt => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];

/** Screen position just after a label (JetBrains Mono advances 0.6 em per character). */
function after(x: number, y: number, label: string, fontSize: number, anchor: Anchor = 'middle'): Pt {
  const width = label.length * fontSize * 0.6;
  const cy = y - fontSize * 0.36;
  // an end-anchored label usually sits against the right edge: its "+" goes before it
  if (anchor === 'end') return [x - width - 10, cy];
  return [(anchor === 'middle' ? x + width / 2 : x + width) + 10, cy];
}

// ── composition ──────────────────────────────────────────────────────────

interface Config {
  name: 'wide' | 'tall';
  /** the SVG viewBox */
  frame: Frame;
  /** font sizes in scene px; must match block-scene.css for this layout (used to place "+" after labels) */
  font: { title: number; tag: number; gauge: number };
  block: BoxSpec;
  chain: {
    y: number;
    headX: number;
    step: number;
    /** recent blocks drawn after the justified checkpoint; the oldest fades out as the chain shifts */
    slots: number;
    /** share of a shift over which the oldest block fades (1 = the whole shift) */
    fadeBy: number;
    finalX: number;
    justifiedX: number;
    /** text above the two checkpoints */
    finalTag: string;
    justifiedTag: string;
    /** baseline of the gap labels and of "~N phút trước", below the chain */
    gapY: number;
    agoY: number;
    agoAnchor: Anchor;
    /** x of "~N phút trước", relative to the finalized checkpoint */
    agoX: number;
    gap: (n: number) => string;
    /** slot numbers above every recent block, or only above the head */
    midTags: boolean;
    /** the dashed line after the justified checkpoint runs to the oldest drawn block (else under it) */
    jrToOldest: boolean;
  };
  platform: BoxSpec;
  module: { w: number; d: number; h: number };
  /** module centres sit at (±x, −y | 0 | +y) on the platform */
  modOffset: { x: number; y: number };
  wallet: Pt;
  node: Pt;
  peers: Pt[];
  builders: Pt[];
  relay: Pt;
  /** back-left validator of the committee; the others follow on the iso axes, 4 + 3 */
  committee: Pt;
  gauge: { x: number; y: number; w: number; statusY: number; done: string };
  labels: Record<LabelKey, LabelSpec>;
  /** "chứng thực n/7" next to the head */
  badge: { x: number; y: number; anchor: Anchor };
  /** bids the relay has received */
  board: { x: number; y: number; anchor: Anchor };
  /**
   * Fast-forward status lines; `wrap` puts the block's status on two lines.
   * `panel` (w × h) backs them with a solid box drawn above the "+" buttons, for when they sit over some.
   */
  ff: { x: number; y: number; wrap: boolean; panel?: { w: number; h: number } };
  /** "this validator is the proposer" line under the node */
  ptag: { x: number; y: number; anchor: Anchor; text: string };
  /** moves for "+" buttons that would otherwise collide with something */
  nudge?: Partial<Record<string, Pt>>;
}

export function makeLayout(c: Config) {
  const { block, platform } = c;
  const module: BoxSpec = { ...c.module, z: platform.h };
  const mods = MOD_GRID.map((m) => ({ ...m, x: m.col * c.modOffset.x, y: m.row * c.modOffset.y }));
  const modAt = (key: ModKey): Pt => {
    const m = mods.find((x) => x.key === key)!;
    return iso(c.node[0], c.node[1], m.x, m.y);
  };
  const modTop = (key: ModKey): Pt => up(modAt(key), platform.h + module.h);
  const onPlatform = (key: ModKey): Pt => up(modAt(key), platform.h);
  /** left corner of a module's top face */
  const modCorner = (key: ModKey): Pt => {
    const m = mods.find((x) => x.key === key)!;
    return iso(c.node[0], c.node[1], m.x - module.w / 2, m.y + module.d / 2, platform.h + module.h);
  };

  const chainX = (pos: number) => c.chain.headX - pos * c.chain.step;
  const head: Pt = [c.chain.headX, c.chain.y];
  const final: Pt = [c.chain.finalX, c.chain.y];
  const justified: Pt = [c.chain.justifiedX, c.chain.y];
  /** half the screen width of a chain block */
  const half = ((block.w + block.d) / 2) * COS30;
  const linkY = -block.h / 2;
  /** tag baselines above a chain block, relative to its ground anchor */
  const tagY = { title: -block.h - 42, slot: -block.h - 29 };

  const validators: Pt[] = Array.from({ length: VOTERS }, (_, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    return [c.committee[0] + col * 34 * COS30 + row * 36 * COS30, c.committee[1] - col * 17 + row * 18] as const;
  });

  const relayModAt = (y: number): Pt => iso(c.relay[0], c.relay[1], 0, y);
  /** bids, the header exchange and the published block all go through the relay software */
  const relayTop = up(relayModAt(RELAY_MODS[0].y), RELAY_PLATFORM.h + RELAY_MODULE.h);
  const headTop = up(head, block.h + 8);
  const peerTop = (i: number) => up(c.peers[i], PEER.h);
  const slabBase = (i: number, n: number) => up(c.builders[i], BENCH.h + n * SLAB_H);
  const builderTop = (i: number) => up(c.builders[i], BENCH.h + TEMPLATE.h);
  const voterTop = (i: number) => up(validators[i], VAL.h + 6);

  const netLanes: Lane[] = [
    { id: 'w', from: c.wallet, to: modAt('rpc'), initial: 'idle' },
    ...c.peers.map((p, i) => ({ id: `p${i}`, from: modAt('p2p'), to: p, initial: 'idle' as const })),
    ...c.builders.map((b, i) => ({ id: `b${i}`, from: c.peers[BUILDER_PEER[i]], to: b, initial: 'idle' as const })),
    ...c.builders.map((b, i) => ({ id: `r${i}`, from: b, to: c.relay, initial: 'idle' as const })),
    { id: 'm', from: modAt('mev'), to: c.relay, initial: 'idle' },
    // idle but visible: its "+" needs a line to sit on
    { id: 'pub', from: c.relay, to: head, initial: 'idle' },
  ];
  // one committee line stays faintly visible so the committee → head "+" sits on a line
  const voteLanes: Lane[] = validators.map((v, i) => ({
    id: `v${i}`,
    from: v,
    to: head,
    initial: i === 1 ? ('idle' as const) : ('off' as const),
  }));

  const afterLabel = (key: LabelKey) => {
    const l = c.labels[key];
    return after(l.x, l.y, l.title, c.font.title, l.anchor);
  };
  const info: Record<string, Pt> = {
    // relationships: the middle of each connection
    'wallet-rpc': mid(c.wallet, modAt('rpc')),
    execution: mid(onPlatform('mempool'), onPlatform('p2p')),
    p2p: mid(modAt('p2p'), c.peers[0]),
    'peer-builder': mid(c.peers[0], c.builders[0]),
    'builder-relay': mid(c.builders[1], c.relay),
    consensus: mid(onPlatform('beacon'), onPlatform('mev')),
    'mev-relay': mid(modAt('mev'), c.relay),
    'relay-chain': mid(c.relay, head),
    attest: mid(validators[1], head),
    parent: [c.chain.headX - c.chain.step / 2, c.chain.y + linkY],
    finality: [(final[0] + justified[0]) / 2, c.chain.y + linkY],
    // details: next to each part's label, or on a module's corner
    wallet: afterLabel('wallet'),
    node: afterLabel('node'),
    rpc: modCorner('rpc'),
    mempool: modCorner('mempool'),
    'p2p-module': modCorner('p2p'),
    validator: modCorner('validator'),
    beacon: modCorner('beacon'),
    mev: modCorner('mev'),
    peers: afterLabel('peers'),
    builders: afterLabel('builders'),
    relay: afterLabel('relay'),
    committee: afterLabel('committee'),
    chain: afterLabel('chain'),
    justified: after(justified[0], c.chain.y + tagY.title, c.chain.justifiedTag, c.font.tag),
    finalized: after(final[0], c.chain.y + tagY.title, c.chain.finalTag, c.font.tag),
    gauge: after(c.gauge.x, c.gauge.y - 8, 'Phiếu cho mốc kỷ nguyên 487.802', c.font.gauge, 'start'),
  };
  for (const [id, d] of Object.entries(c.nudge ?? {})) {
    if (d && info[id]) info[id] = [info[id][0] + d[0], info[id][1] + d[1]];
  }

  return {
    ...c,
    module,
    mods,
    modAt,
    modTop,
    chainX,
    head,
    final,
    justified,
    half,
    linkY,
    tagY,
    validators,
    relayModAt,
    relayTop,
    headTop,
    peerTop,
    slabBase,
    builderTop,
    voterTop,
    netLanes,
    voteLanes,
    lanes: [...netLanes, ...voteLanes],
    info,
  };
}

export type Layout = ReturnType<typeof makeLayout>;

// ── landscape: tablets and desktops ──────────────────────────────────────

const W_NODE: Pt = [235, 370];
const W_RELAY: Pt = [540, 436];

export const WIDE = makeLayout({
  name: 'wide',
  frame: [0, 26, 1000, 474],
  font: { title: 11, tag: 9.5, gauge: 9 },
  block: { w: 40, d: 40, h: 36 },
  chain: {
    y: 115,
    headX: 870,
    step: 110,
    slots: 4,
    fadeBy: 1,
    finalX: 80,
    justifiedX: 290,
    finalTag: 'cuối cùng · finalized',
    justifiedTag: 'đủ 2/3 · justified',
    gapY: 38,
    agoY: 38,
    agoAnchor: 'middle',
    agoX: 0,
    gap: (n) => `··· ${n} khe ···`,
    midTags: true,
    jrToOldest: false,
  },
  platform: { w: 170, d: 150, h: 8 },
  module: { w: 40, d: 30, h: 22 },
  modOffset: { x: 38, y: 52 },
  wallet: [52, 412],
  node: W_NODE,
  peers: [
    [415, 262],
    [452, 335],
  ],
  builders: [
    [590, 238],
    [650, 298],
    [710, 358],
  ],
  relay: W_RELAY,
  committee: [832, 322],
  gauge: { x: 40, y: 186, w: 330, statusY: 21, done: 'đủ 2/3 ✓ · được chứng minh khi hết kỷ nguyên' },
  labels: {
    wallet: { x: 52, y: 452, title: 'Ví', sub: 'wallet' },
    node: { x: W_NODE[0], y: W_NODE[1] + 100, title: 'Nút trình xác thực', sub: 'thực thi · đồng thuận · MEV-Boost' },
    peers: { x: 452, y: 369, title: 'Nút khác', sub: 'peers' },
    builders: { x: 636, y: 222, title: 'Người xây khối', sub: 'block builders', anchor: 'start' },
    relay: { x: W_RELAY[0], y: W_RELAY[1] + 44, title: 'Nút khác', sub: 'chạy relay MEV-Boost' },
    committee: { x: 880, y: 392, title: 'Ủy ban', sub: 'trình xác thực khác' },
    chain: { x: 912, y: 123, title: 'Chuỗi khối', sub: 'blockchain', anchor: 'start' },
  },
  badge: { x: 912, y: 73, anchor: 'start' },
  board: { x: W_RELAY[0] - 58, y: W_RELAY[1] - 6, anchor: 'end' },
  ff: { x: 40, y: 238, wrap: false },
  ptag: { x: W_NODE[0], y: W_NODE[1] + 126, anchor: 'middle', text: '↑ trình xác thực này là người đề xuất của khe' },
});

// ── portrait: phones ─────────────────────────────────────────────────────
// Read bottom to top: the wallet and the node at the bottom, the network in
// the middle, the chain on top. Fonts are larger (see block-scene.css) and the
// English sub-labels are left to the popups.

const T_NODE: Pt = [168, 482];
const T_RELAY: Pt = [300, 432];

export const TALL = makeLayout({
  name: 'tall',
  frame: [0, -6, 360, 592],
  font: { title: 12.5, tag: 10, gauge: 10 },
  block: { w: 28, d: 28, h: 26 },
  chain: {
    y: 96,
    headX: 326,
    step: 66,
    slots: 3,
    fadeBy: 0.3,
    finalX: 30,
    justifiedX: 110,
    finalTag: 'cuối cùng',
    justifiedTag: 'đủ 2/3',
    gapY: 52,
    agoY: 38,
    agoAnchor: 'start',
    agoX: -26,
    gap: (n) => `${n} khe`,
    midTags: false,
    jrToOldest: true,
  },
  platform: { w: 150, d: 130, h: 8 },
  module: { w: 36, d: 27, h: 20 },
  modOffset: { x: 33, y: 46 },
  wallet: [24, 460],
  node: T_NODE,
  peers: [
    [45, 340],
    [85, 375],
  ],
  builders: [
    [115, 290],
    [165, 320],
    [215, 350],
  ],
  relay: T_RELAY,
  committee: [195, 246],
  gauge: { x: 14, y: 178, w: 180, statusY: 34, done: 'đủ 2/3 ✓' },
  labels: {
    wallet: { x: 24, y: 492, title: 'Ví' },
    node: { x: T_NODE[0], y: 566, title: 'Nút trình xác thực' },
    peers: { x: 85, y: 409, title: 'Nút khác' },
    builders: { x: 14, y: 228, title: 'Người xây khối', anchor: 'start' },
    relay: { x: 356, y: 366, title: 'Nút khác', sub: 'chạy relay MEV-Boost', anchor: 'end' },
    committee: { x: 240, y: 290, title: 'Ủy ban' },
    chain: { x: 4, y: 8, title: 'Chuỗi khối', anchor: 'start' },
  },
  badge: { x: 348, y: 134, anchor: 'end' },
  board: { x: 356, y: 306, anchor: 'end' },
  ff: { x: 14, y: 318, wrap: true, panel: { w: 304, h: 62 } },
  ptag: { x: T_NODE[0], y: 580, anchor: 'middle', text: '↑ trình xác thực này là người đề xuất' },
});
