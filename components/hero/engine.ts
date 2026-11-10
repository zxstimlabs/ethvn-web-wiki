/**
 * Animation engine of the home hero. Every frame is a pure function of the
 * loop's position (`Frame`): it mutates attributes of the static SVG (found
 * through `data-k`) and never re-renders React. Positions come from a
 * `Layout`, so the wide and the tall versions run the same story.
 */

import type { Pt } from '@/lib/hero/iso';
import {
  BUILDERS as BUILDER_COUNT,
  FF,
  STORY,
  STORY_LEN,
  FF_STEPS,
  LAYERS,
  SLOTS_PER_EPOCH,
  SLOT_SECONDS,
  type SlotClock,
  T,
  VOTERS,
  VOTES_DONE,
  activeSteps,
  backOut,
  bidWindow,
  bidsFor,
  checkpoints,
  clamp01,
  easeIn,
  easeInOut,
  easeOut,
  end,
  epochVotes,
  at,
  finalitySlot,
  lerp,
  prog,
  slabTime,
  storyClock,
  voteWindow,
} from '@/lib/hero/timeline';
import { STEPS } from './content';
import { BUILDER_PEER, type LaneState, type Layout, type ModKey, TRAVEL_SCALE, up } from './layout';

export interface Dom {
  L: Layout;
  root: HTMLElement;
  net: SVGGElement;
  chainRow: SVGGElement;
  ff: SVGGElement;
  ffLine1: SVGTextElement;
  ffLine2: SVGTextElement;
  ffLine3: SVGTextElement;
  chain: SVGGElement[];
  tags: SVGTextElement[];
  link0: SVGGElement;
  finalInner: SVGGElement;
  justInner: SVGGElement;
  finalSlot: SVGTextElement;
  finalAgo: SVGTextElement;
  justSlot: SVGTextElement;
  gapFJ: SVGTextElement;
  gapJR: SVGTextElement;
  gauge: SVGGElement;
  gaugeTitle: SVGTextElement;
  gaugeFill: SVGRectElement;
  gaugePct: SVGTextElement;
  gaugeStatus: SVGTextElement;
  wallet: SVGGElement;
  modules: Record<ModKey, SVGGElement>;
  mempoolTx: SVGGElement;
  peerTx: SVGGElement[];
  txMain: SVGGElement;
  txPeer: SVGGElement[];
  txBuilder: SVGGElement[];
  builders: SVGGElement[];
  slabs: SVGGElement[][];
  bids: SVGTextElement[];
  bidPkts: SVGGElement[];
  msg: SVGGElement;
  msgText: SVGTextElement;
  pkt: SVGGElement;
  seal: SVGGElement;
  sealInner: SVGGElement;
  ptag: SVGGElement;
  validators: SVGGElement[];
  votes: SVGGElement[];
  badge: SVGGElement;
  badgeCount: SVGTSpanElement;
  ringHead: SVGEllipseElement;
  lanes: Record<string, SVGPathElement>;
  hudSlot: HTMLElement;
  hudEpoch: HTMLElement | null;
  hudPos: HTMLElement;
  hudBar: HTMLElement;
  steps: HTMLElement[];
}

export function collect(root: HTMLElement, L: Layout): Dom {
  const one = <E extends Element>(k: string) => {
    const el = root.querySelector<E>(`[data-k="${k}"]`);
    if (!el) throw new Error(`block-scene: missing [data-k="${k}"]`);
    return el;
  };
  const many = <E extends Element>(k: string, n: number) => Array.from({ length: n }, (_, i) => one<E>(`${k}-${i}`));
  return {
    L,
    root,
    net: one('net'),
    chainRow: one('chainrow'),
    ff: one('ff'),
    ffLine1: one('ff-line1'),
    ffLine2: one('ff-line2'),
    ffLine3: one('ff-line3'),
    chain: many('chain', L.chain.slots),
    tags: many('tag', L.chain.slots),
    link0: one('link-0'),
    finalInner: one('final-inner'),
    justInner: one('just-inner'),
    finalSlot: one('final-slot'),
    finalAgo: one('final-ago'),
    justSlot: one('just-slot'),
    gapFJ: one('gap-fj'),
    gapJR: one('gap-jr'),
    gauge: one('gauge'),
    gaugeTitle: one('gauge-title'),
    gaugeFill: one('gauge-fill'),
    gaugePct: one('gauge-pct'),
    gaugeStatus: one('gauge-status'),
    wallet: one('wallet'),
    modules: Object.fromEntries(L.mods.map((m) => [m.key, one<SVGGElement>(`mod-${m.key}`)])) as Record<ModKey, SVGGElement>,
    mempoolTx: one('mempool-tx'),
    peerTx: many('peer-tx', L.peers.length),
    txMain: one('tx-main'),
    txPeer: many('tx-peer', L.peers.length),
    txBuilder: many('tx-builder', BUILDER_COUNT),
    builders: many('builder', BUILDER_COUNT),
    slabs: Array.from({ length: BUILDER_COUNT }, (_, i) => many<SVGGElement>(`slab-${i}`, LAYERS)),
    bids: many('bid', BUILDER_COUNT),
    bidPkts: many('bidpkt', BUILDER_COUNT),
    msg: one('msg'),
    msgText: one('msg-text'),
    pkt: one('pkt'),
    seal: one('seal'),
    sealInner: one('seal-inner'),
    ptag: one('ptag'),
    validators: many('val', VOTERS),
    votes: many('vote', VOTERS),
    badge: one('badge'),
    badgeCount: one('badge-count'),
    ringHead: one('ring-head'),
    lanes: Object.fromEntries(L.lanes.map((l) => [l.id, one<SVGPathElement>(`lane-${l.id}`)])),
    hudSlot: one('hud-slot'),
    hudEpoch: root.querySelector<HTMLElement>('[data-k="hud-epoch"]'),
    hudPos: one('hud-pos'),
    hudBar: one('hud-bar'),
    steps: many('step', STEPS.length),
  };
}

const fmt = new Intl.NumberFormat('vi-VN');
const fmtEth = new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 3, maximumFractionDigits: 3 });
const fmtPct = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1 });
const n2 = (v: number) => v.toFixed(2);

function setAttr(el: Element, name: string, value: string) {
  if (el.getAttribute(name) !== value) el.setAttribute(name, value);
}
function place(el: Element, [x, y]: Pt, s = 1) {
  setAttr(el, 'transform', s === 1 ? `translate(${n2(x)} ${n2(y)})` : `translate(${n2(x)} ${n2(y)}) scale(${s.toFixed(3)})`);
}
function fade(el: Element, o: number) {
  setAttr(el, 'opacity', o <= 0 ? '0' : o >= 1 ? '1' : o.toFixed(3));
}
function text(el: Element, value: string) {
  if (el.textContent !== value) el.textContent = value;
}
/** straight move from a to b with a parabolic hop of height `arc` */
function hop(a: Pt, b: Pt, k: number, arc: number): Pt {
  return [lerp(a[0], b[0], k), lerp(a[1], b[1], k) - arc * Math.sin(Math.PI * k)];
}
/** position at fraction k along a polyline */
function along(points: Pt[], k: number): Pt {
  const lengths = points.slice(1).map((p, i) => Math.hypot(p[0] - points[i][0], p[1] - points[i][1]));
  let d = clamp01(k) * lengths.reduce((a, b) => a + b, 0);
  for (let i = 0; i < lengths.length; i++) {
    if (d <= lengths[i] || i === lengths.length - 1) {
      const f = lengths[i] ? clamp01(d / lengths[i]) : 1;
      return [lerp(points[i][0], points[i + 1][0], f), lerp(points[i][1], points[i + 1][1], f)];
    }
    d -= lengths[i];
  }
  return points[points.length - 1];
}
const within = (t: number, w: readonly [number, number]) => t >= w[0] && t < w[0] + w[1];
const minutes = (slots: number) => Math.round((slots * SLOT_SECONDS) / 60);

/** A pending transaction: shown from the previous slot until the block lands, then again once this slot's copy arrives. */
function pendingScale(t: number, arrive: number): number {
  if (t < T.landed) return 1;
  if (t < T.landed + 0.2) return 1 - easeIn(prog(t, T.landed, 0.2));
  if (t < arrive) return 0;
  return backOut(prog(t, arrive, 0.28));
}

function ring(el: SVGEllipseElement, at: Pt, k: number, tone: string, from = 24, to = 62) {
  const e = easeOut(k);
  const rx = lerp(from, to, e);
  setAttr(el, 'data-tone', tone);
  setAttr(el, 'cx', n2(at[0]));
  setAttr(el, 'cy', n2(at[1]));
  setAttr(el, 'rx', n2(rx));
  setAttr(el, 'ry', n2(rx / 2));
  fade(el, 0.85 * (1 - e));
}

/** Recent blocks, shifted back by `u` places; the oldest fades out as it goes. */
function placeChain(dom: Dom, u: number, head: number) {
  const { L } = dom;
  for (let k = 0; k < L.chain.slots; k++) {
    place(dom.chain[k], [L.chainX(k + u), L.chain.y]);
    fade(dom.chain[k], k === L.chain.slots - 1 ? 1 - clamp01(u / L.chain.fadeBy) : 1);
    text(dom.tags[k], fmt.format(head - k));
  }
}

/** Checkpoints, gap labels and the epoch's 2/3 gauge, for head slot H (fractional f during the fast-forward). */
function renderFinality(dom: Dom, H: number, slot: number, votesLanded: number, bump: number) {
  const { L } = dom;
  const cp = checkpoints(slot);
  text(dom.finalSlot, fmt.format(cp.finalized));
  text(dom.justSlot, fmt.format(cp.justified));
  text(dom.finalAgo, `~${minutes(H - cp.finalized)} phút trước`);
  text(dom.gapFJ, L.chain.gap(cp.justified - cp.finalized - 1));
  text(dom.gapJR, L.chain.gap(Math.max(0, H - (L.chain.slots - 1) - cp.justified - 1)));
  setAttr(dom.finalInner, 'transform', `translate(0 ${n2(-7 * bump)})`);
  setAttr(dom.justInner, 'transform', `translate(0 ${n2(-7 * bump)})`);

  const share = epochVotes(slot % SLOTS_PER_EPOCH, votesLanded);
  const done = share >= 2 / 3;
  text(dom.gaugeTitle, `Phiếu cho mốc kỷ nguyên ${fmt.format(Math.floor(slot / SLOTS_PER_EPOCH))}`);
  setAttr(dom.gaugeFill, 'width', n2(L.gauge.w * share));
  text(dom.gaugePct, `${fmtPct.format(share * 100)}%`);
  text(dom.gaugeStatus, done ? L.gauge.done : 'cần 2/3 tổng ETH đặt cọc');
  setAttr(dom.gauge, 'data-done', String(done));
}

function renderHud(dom: Dom, slot: number, t: number, steps: boolean[]) {
  text(dom.hudSlot, fmt.format(slot));
  if (dom.hudEpoch) text(dom.hudEpoch, fmt.format(Math.floor(slot / SLOTS_PER_EPOCH)));
  text(dom.hudPos, String((slot % SLOTS_PER_EPOCH) + 1));
  dom.hudBar.style.transform = `scaleX(${(t / SLOT_SECONDS).toFixed(4)})`;
  steps.forEach((on, i) => setAttr(dom.steps[i], 'data-active', String(on)));
}

/** One moment of a slot. The story shows the second half of slot S and the first half of S + 1. */
export function renderStory(dom: Dom, clock: SlotClock) {
  const { L } = dom;
  const { slot: S, t, slotInEpoch } = clock;
  const lanes: Record<string, LaneState> = Object.fromEntries(L.lanes.map((l) => [l.id, l.initial]));

  setAttr(dom.root, 'data-mode', 'story');
  fade(dom.net, 1);
  fade(dom.chainRow, 1);
  fade(dom.ff, 0);

  // ── chain: shifts back one place while the new block flies in, then relabels
  const landed = t >= T.landed;
  const H = landed ? S : S - 1;
  placeChain(dom, !landed && t >= T.publish[0] ? easeInOut(prog(t, ...T.publish)) : 0, H);
  fade(dom.link0, landed ? easeOut(prog(t, T.landed, T.linkDraw)) : 1);

  // ── proposing: beacon → MEV-Boost → relay and back, the validator signs, the relay publishes
  const bids = bidsFor(S);
  const beaconTop = L.modTop('beacon');
  const mevTop = L.modTop('mev');
  const valTop = L.modTop('validator');
  let msg: { at: Pt; tone: string; label: string } | null = null;
  if (within(t, T.request)) {
    msg = { at: along([beaconTop, mevTop, L.relayTop], easeInOut(prog(t, ...T.request))), tone: 'amber', label: 'xin khối' };
    lanes.m = 'amber';
  } else if (within(t, T.header)) {
    msg = {
      at: along([L.relayTop, mevTop, beaconTop, valTop], easeInOut(prog(t, ...T.header))),
      tone: 'block',
      label: `${fmtEth.format(bids.final[bids.winner])} ETH`,
    };
    lanes.m = 'block';
  } else if (within(t, T.signed)) {
    msg = { at: along([valTop, beaconTop, mevTop, L.relayTop], easeInOut(prog(t, ...T.signed))), tone: 'amber', label: 'đã ký' };
    lanes.m = 'amber';
  }
  if (msg) {
    place(dom.msg, msg.at);
    setAttr(dom.msg, 'data-tone', msg.tone);
    text(dom.msgText, msg.label);
    fade(dom.msg, 1);
  } else fade(dom.msg, 0);

  const signing = t >= T.sign && t < T.signed[0];
  if (t >= T.sign && t < end(T.signed)) {
    setAttr(dom.sealInner, 'transform', `scale(${backOut(prog(t, T.sign, 0.3)).toFixed(3)})`);
    fade(dom.seal, 1 - prog(t, end(T.signed) - 0.2, 0.2));
  } else fade(dom.seal, 0);

  fade(dom.ptag, t < T.landed ? Math.min(prog(t, 0, 0.3), 1 - prog(t, T.landed - 0.25, 0.25)) : 0);

  for (const m of L.mods) {
    let state = 'idle';
    if (m.key === 'validator' && t < T.landed) state = signing ? 'signing' : 'proposer';
    if (m.key === 'mempool' && within(t, T.tx.toMempool)) state = 'busy';
    if (m.key === 'p2p' && (within(t, T.tx.toP2P) || within(t, T.tx.toPeers))) state = 'busy';
    if ((m.key === 'mev' || m.key === 'beacon') && msg) state = 'busy';
    if (m.key === 'rpc' && within(t, T.tx.send)) state = 'busy';
    setAttr(dom.modules[m.key], 'data-state', state);
  }

  if (!landed && t >= T.publish[0]) {
    const k = easeInOut(prog(t, ...T.publish));
    place(dom.pkt, hop(L.relayTop, L.head, k, 40), lerp(TRAVEL_SCALE, 1, easeInOut(clamp01((k - 0.55) / 0.45))));
    fade(dom.pkt, 1);
    lanes.pub = 'block';
  } else fade(dom.pkt, 0);

  // ── builders: full candidate blocks from the previous slot until the winner is published,
  // then they start again with the new transaction and bid for the next block
  const next = bidsFor(S + 1);
  for (let i = 0; i < BUILDER_COUNT; i++) {
    for (let n = 0; n < LAYERS; n++) {
      const el = dom.slabs[i][n];
      if (t < T.publish[0]) {
        setAttr(el, 'transform', 'translate(0 0)');
        fade(el, 1);
      } else if (t < T.publish[0] + 0.3) {
        fade(el, 1 - prog(t, T.publish[0], 0.3));
      } else if (t >= slabTime(i, n)) {
        const k = easeOut(prog(t, slabTime(i, n), 0.22));
        setAttr(el, 'transform', `translate(0 ${n2(-6 * (1 - k))})`);
        fade(el, k);
      } else fade(el, 0);
    }
    setAttr(dom.builders[i], 'data-win', String(i === bids.winner && t >= T.header[0] && t < T.publish[0]));

    // bids travel to the relay; the board shows the latest bid per builder
    let shown: number | null = null;
    let win = false;
    if (t < T.publish[0]) {
      shown = bids.final[i];
      win = i === bids.winner && t >= T.header[0];
    } else if (t >= bidWindow(i, 1).end) shown = next.final[i];
    else if (t >= bidWindow(i, 0).end) shown = next.first[i];
    text(dom.bids[i], shown === null ? `B${i + 1}  —` : `B${i + 1}  ${fmtEth.format(shown)}${win ? ' ★' : ''}`);
    setAttr(dom.bids[i], 'data-win', String(win));

    const live = [bidWindow(i, 0), bidWindow(i, 1)].find((w) => t >= w.start && t < w.end);
    if (live) {
      place(dom.bidPkts[i], hop(L.builderTop(i), L.relayTop, easeInOut(prog(t, live.start, T.bids.dur)), 16));
      fade(dom.bidPkts[i], 1);
      lanes[`r${i}`] = 'block';
    } else fade(dom.bidPkts[i], 0);
  }

  // ── attestations converge on the new head and count toward the epoch's 2/3
  let counted = 0;
  for (let i = 0; i < VOTERS; i++) {
    const w = voteWindow(i);
    if (t >= w.start && t < w.end) {
      place(dom.votes[i], hop(L.voterTop(i), L.headTop, easeInOut(prog(t, w.start, T.votes.dur)), 24));
      fade(dom.votes[i], 1);
      lanes[`v${i}`] = 'vote';
    } else fade(dom.votes[i], 0);
    if (t >= w.end) counted++;
    setAttr(dom.validators[i], 'data-state', t >= w.start - 0.1 && t < w.start + 0.35 ? 'voting' : 'idle');
  }
  if (t < T.publish[0]) {
    text(dom.badgeCount, `${VOTERS}/${VOTERS}`);
    fade(dom.badge, 1);
  } else if (t < T.votes.start) {
    fade(dom.badge, 1 - prog(t, T.publish[0], 0.3));
  } else {
    text(dom.badgeCount, `${counted}/${VOTERS}`);
    fade(dom.badge, prog(t, T.votes.start, 0.25));
  }

  if (landed && t < T.landed + 0.7) ring(dom.ringHead, L.head, prog(t, T.landed, 0.7), 'block');
  else if (t >= VOTES_DONE && t < VOTES_DONE + 0.7) ring(dom.ringHead, L.head, prog(t, VOTES_DONE, 0.7), 'vote');
  else fade(dom.ringHead, 0);

  const bump = slotInEpoch === 0 && t < 1.2 ? Math.sin(Math.PI * prog(t, 0, 1.2)) : 0;
  renderFinality(dom, H, S, t >= T.votes.start ? counted : 0, bump);

  // ── a new transaction: wallet → RPC → mempool → P2P → peers → builders
  const tx = T.tx;
  const rpcTop = L.modTop('rpc');
  const memTop = L.modTop('mempool');
  const p2pTop = L.modTop('p2p');
  let main: Pt | null = null;
  if (within(t, tx.send)) {
    main = hop(up(L.wallet, 24), rpcTop, easeInOut(prog(t, ...tx.send)), 18);
    lanes.w = 'tx';
  } else if (t >= end(tx.send) && t < end(tx.toMempool)) main = along([rpcTop, memTop], easeInOut(prog(t, ...tx.toMempool)));
  else if (t >= end(tx.toMempool) && t < end(tx.toP2P)) main = along([memTop, p2pTop], easeInOut(prog(t, ...tx.toP2P)));
  else if (t >= end(tx.toP2P) && t < tx.toPeers[0]) main = p2pTop;
  if (main) {
    place(dom.txMain, main);
    fade(dom.txMain, 1);
  } else fade(dom.txMain, 0);
  setAttr(dom.wallet, 'data-send', String(t >= tx.send[0] - 0.15 && t < tx.send[0] + 0.35));

  const memScale = pendingScale(t, end(tx.toMempool));
  place(dom.mempoolTx, memTop, Math.max(memScale, 0.001));
  fade(dom.mempoolTx, memScale > 0 ? 1 : 0);

  for (let i = 0; i < L.peers.length; i++) {
    if (within(t, tx.toPeers)) {
      place(dom.txPeer[i], hop(p2pTop, L.peerTop(i), easeInOut(prog(t, ...tx.toPeers)), 20));
      fade(dom.txPeer[i], 1);
      lanes[`p${i}`] = 'tx';
    } else fade(dom.txPeer[i], 0);
    const ps = pendingScale(t, end(tx.toPeers));
    place(dom.peerTx[i], L.peerTop(i), Math.max(ps, 0.001));
    fade(dom.peerTx[i], ps > 0 ? 1 : 0);
  }
  for (let i = 0; i < BUILDER_COUNT; i++) {
    if (within(t, tx.toBuilders)) {
      place(dom.txBuilder[i], hop(L.peerTop(BUILDER_PEER[i]), L.slabBase(i, 0), easeInOut(prog(t, ...tx.toBuilders)), 20));
      fade(dom.txBuilder[i], 1);
      lanes[`b${i}`] = 'tx';
    } else fade(dom.txBuilder[i], 0);
  }

  for (const id in lanes) setAttr(dom.lanes[id], 'data-on', lanes[id]);
  renderHud(dom, S, t, activeSteps(t));
}

/**
 * After the story: fast-forward from the story's block `S` until it is
 * finalized, with every validator's votes filling the 2/3 gauge epoch by
 * epoch. `t` is seconds into the fast-forward; `next` is the slot the next
 * loop starts in, shown during the hand-back.
 */
function renderFF(dom: Dom, S: number, t: number, next: number) {
  const { L } = dom;
  const lanes: Record<string, LaneState> = Object.fromEntries(L.lanes.map((l) => [l.id, l.initial]));

  // Everything not drawn here rests in the story's final state (or, during the
  // hand-back, in the next story's opening state).
  if (t >= FF.back) {
    renderStory(dom, at(next, STORY.start));
    fade(dom.chainRow, prog(t, FF.back, 0.4));
    fade(dom.net, lerp(0.18, 1, easeInOut(prog(t, FF.out, 0.6))));
    return;
  }
  renderStory(dom, at(S, STORY.end));
  setAttr(dom.root, 'data-mode', 'ff');
  fade(dom.msg, 0);
  fade(dom.ptag, 0);

  fade(dom.net, t >= FF.out ? lerp(0.18, 1, easeInOut(prog(t, FF.out, 0.6))) : lerp(1, 0.18, easeInOut(prog(t, 0, FF.dim))));
  fade(dom.chainRow, 1 - prog(t, FF.out, FF.back - FF.out));

  // simulated slots: from the slot after the story's block to just past its finality
  const target = finalitySlot(S);
  const sim = lerp(S + 1, target + 1.5, easeInOut(prog(t, ...FF.run)));
  const n = Math.floor(sim);
  const f = sim - n;
  placeChain(dom, f, n);
  fade(dom.link0, 1);
  fade(dom.badge, 0);
  fade(dom.ringHead, 0);
  const inEpoch = n % SLOTS_PER_EPOCH;
  const bump = inEpoch < 2 && n > S + 1 ? Math.sin((Math.PI * (inEpoch + f)) / 2) : 0;
  renderFinality(dom, n, n, f * VOTERS, bump);

  // every validator votes once per epoch: a steady stream toward the head
  const running = t >= FF.run[0] && t < end(FF.run);
  for (let i = 0; i < VOTERS; i++) {
    const k = ((t - FF.run[0]) / 0.45 + i / VOTERS) % 1;
    if (running) {
      place(dom.votes[i], hop(L.voterTop(i), L.headTop, easeInOut(k), 22));
      fade(dom.votes[i], Math.min(1, k / 0.1, (1 - k) / 0.1));
      lanes[`v${i}`] = 'vote';
    } else fade(dom.votes[i], 0);
    setAttr(dom.validators[i], 'data-state', running && k < 0.25 ? 'voting' : 'idle');
  }
  for (const id in lanes) {
    if (id.startsWith('v')) setAttr(dom.lanes[id], 'data-on', lanes[id]);
  }

  // status of the story's block
  const cp = checkpoints(n);
  const epochStart = Math.floor(S / SLOTS_PER_EPOCH) * SLOTS_PER_EPOCH;
  let status: string;
  let state: string;
  if (cp.finalized >= S) {
    status = 'đạt tính cuối cùng ✓ (finalized)';
    state = 'final';
  } else if (cp.justified >= epochStart) {
    status = 'mốc kỷ nguyên đã đủ 2/3, chờ mốc tiếp theo';
    state = 'just';
  } else {
    status = 'đã vào chuỗi, chờ đủ 2/3 phiếu';
    state = 'wait';
  }
  const block = `Khối ${fmt.format(S)}`;
  text(dom.ffLine1, `⏩ Tua nhanh: +${fmt.format(n - S)} khe (~${minutes(n - S)} phút)`);
  text(dom.ffLine2, L.ff.wrap ? `${block}:` : `${block}: ${status}`);
  text(dom.ffLine3, L.ff.wrap ? status : '');
  setAttr(dom.ff, 'data-state', state);
  fade(dom.ff, Math.min(prog(t, 0.2, 0.5), 1 - prog(t, FF.out, FF.back - FF.out)));

  renderHud(dom, n, t, FF_STEPS);
}

/**
 * A moment of the loop: `tau` seconds in, telling the transaction sent in slot
 * `base` and the block of `base + 1`; `next` is the next loop's `base`.
 */
export interface Frame {
  base: number;
  next: number;
  tau: number;
}

export function render(dom: Dom, { base, next, tau }: Frame) {
  if (tau < STORY_LEN) renderStory(dom, storyClock(base, tau));
  else renderFF(dom, base + 1, tau - STORY_LEN, next);
}
