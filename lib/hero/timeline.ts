/**
 * Timeline for the home hero: one Ethereum slot (12 s), driven by the real
 * mainnet slot clock. Every visual is a pure function of `t` (seconds into the
 * current slot), so the loop never drifts, can start mid-slot, and survives
 * throttled or hidden tabs without bookkeeping.
 *
 * Story inside one slot, as drawn (a home staker's node whose validator is
 * this slot's proposer):
 *   0.0  the beacon node asks MEV-Boost for a block; MEV-Boost asks the relay
 *   0.5  the relay returns the highest bid's header
 *   1.3  the validator signs the (blinded) header
 *   1.8  the signed header goes back to the relay
 *   2.4  the relay publishes the full block; it lands on the chain at 3.4
 *   4.0  this slot's committee attests to the new head
 *   6.6  a wallet sends a new transaction to the node's RPC → mempool
 *   7.9  it propagates over P2P to peers and on to the builders
 *   9.2  builders stack transactions into candidate blocks and bid via the relay
 *
 * The loop alternates real slots: the story above plays in real time on even
 * slots; odd slots fast-forward until the story's block is finalized.
 *
 * The 2/3 rule is not per block. Each epoch every validator votes once; when
 * the votes reach 2/3 of all staked ETH, that epoch's checkpoint is justified,
 * and two justified checkpoints in a row finalize the earlier one.
 *
 * Builder → relay → MEV-Boost is how most mainnet blocks are made today. When
 * ePBS (EIP-7732, planned for the Glamsterdam upgrade) reaches mainnet, the
 * relay steps change.
 */

export const SLOT_SECONDS = 12;
export const SLOTS_PER_EPOCH = 32;
/** Beacon chain genesis: 2020-12-01 12:00:23 UTC. */
export const GENESIS_TIME = 1606824023;
/** Share of validators assumed to vote on time (mainnet is usually ~99%). */
export const PARTICIPATION = 0.99;
export const VOTERS = 7;
export const BUILDERS = 3;
export const LAYERS = 5;

export interface SlotClock {
  slot: number;
  /** seconds into the slot, 0 ≤ t < 12 */
  t: number;
  epoch: number;
  slotInEpoch: number;
}

export function slotClock(ms: number): SlotClock {
  const s = ms / 1000 - GENESIS_TIME;
  const slot = Math.floor(s / SLOT_SECONDS);
  return {
    slot,
    t: s - slot * SLOT_SECONDS,
    epoch: Math.floor(slot / SLOTS_PER_EPOCH),
    slotInEpoch: slot % SLOTS_PER_EPOCH,
  };
}

/** Checkpoints in a healthy network: justified = start of epoch − 1, finalized = start of epoch − 2. */
export function checkpoints(slot: number) {
  const epoch = Math.floor(slot / SLOTS_PER_EPOCH);
  return {
    justified: (epoch - 1) * SLOTS_PER_EPOCH,
    finalized: (epoch - 2) * SLOTS_PER_EPOCH,
  };
}

/** Deterministic pseudo-random number in [0, 1) for a slot and a salt. */
export function hash01(slot: number, salt: number): number {
  let h = Math.imul(slot ^ Math.imul(salt + 1, 0x9e3779b1), 0x85ebca6b);
  h ^= h >>> 13;
  h = Math.imul(h, 0xc2b2ae35);
  h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}

/** Builder bids (ETH paid to the proposer) for the block of `blockSlot`. */
export function bidsFor(blockSlot: number) {
  const final = Array.from({ length: BUILDERS }, (_, i) => 0.018 + 0.04 * hash01(blockSlot, i));
  const first = final.map((v, i) => v * (0.6 + 0.2 * hash01(blockSlot, i + 7)));
  const winner = final.indexOf(Math.max(...final));
  return { first, final, winner };
}

// ── easing ───────────────────────────────────────────────────────────────

export const clamp01 = (x: number) => (x < 0 ? 0 : x > 1 ? 1 : x);
export const lerp = (a: number, b: number, k: number) => a + (b - a) * k;
/** Progress of `t` through the window [start, start + dur], clamped to 0..1. */
export const prog = (t: number, start: number, dur: number) => clamp01((t - start) / dur);

export const easeInOut = (k: number) => (k < 0.5 ? 4 * k * k * k : 1 - (-2 * k + 2) ** 3 / 2);
export const easeOut = (k: number) => 1 - (1 - k) ** 3;
export const easeIn = (k: number) => k * k * k;
/** Small overshoot, for things that pop into place. */
export const backOut = (k: number) => 1 + 2.2 * (k - 1) ** 3 + 1.2 * (k - 1) ** 2;

// ── schedule (seconds into the slot) ─────────────────────────────────────

export const T = {
  request: [0, 0.5],
  header: [0.5, 0.8],
  sign: 1.3,
  signDur: 0.5,
  signed: [1.8, 0.6],
  publish: [2.4, 1.0],
  /** the block is on the chain; nodes drop its transactions from their mempools */
  landed: 3.4,
  linkDraw: 0.35,
  votes: { start: 4.0, stagger: 0.25, dur: 0.8 },
  tx: {
    send: [6.6, 0.6],
    toMempool: [7.25, 0.3],
    toP2P: [7.6, 0.3],
    toPeers: [7.95, 0.55],
    toBuilders: [8.6, 0.6],
  },
  /** builder i adds slab n at build.start + n·step + i·stagger; slab 0 is the wallet's transaction */
  build: { start: 9.2, step: 0.4, stagger: 0.1 },
  /** builder i sends bid round r at bids.start + i·stagger + r·round, arriving after dur */
  bids: { start: 9.9, stagger: 0.25, round: 1.0, dur: 0.5 },
  /** static frame used for reduced motion and before hydration */
  still: 11.95,
} as const;

export const end = (w: readonly [number, number]) => w[0] + w[1];

export function voteWindow(i: number) {
  const start = T.votes.start + i * T.votes.stagger;
  return { start, end: start + T.votes.dur };
}
export const VOTES_DONE = voteWindow(VOTERS - 1).end;

export function slabTime(builder: number, n: number) {
  if (n === 0) return end(T.tx.toBuilders);
  return T.build.start + n * T.build.step + builder * T.build.stagger;
}

export function bidWindow(builder: number, round: number) {
  const start = T.bids.start + builder * T.bids.stagger + round * T.bids.round;
  return { start, end: start + T.bids.dur };
}

/** Share of all staked ETH that has voted for this epoch's checkpoint. */
export function epochVotes(slotInEpoch: number, votesLanded: number): number {
  return (PARTICIPATION / SLOTS_PER_EPOCH) * (slotInEpoch + votesLanded / VOTERS);
}

// ── loop: a real-time slot, then a fast-forward to finality ──────────────

/**
 * The loop alternates real slots: even slots play the 12 s story in real time,
 * odd slots fast-forward from the story's block until it is finalized, then
 * the next even slot is live again.
 */
export const isStorySlot = (slot: number) => slot % 2 === 0;

export const FF = {
  /** network dims, overlay appears */
  dim: 0.6,
  /** simulated slots advance over this window (eased) */
  run: [0.6, 10.0],
  /** chain row fades out, then back in showing the present */
  out: 11.4,
  back: 11.6,
} as const;

/**
 * First slot at whose start `slot` is finalized in a healthy network: the
 * finalized checkpoint must reach it, so it takes 64–96 slots (13–19 min).
 */
export function finalitySlot(slot: number): number {
  return (Math.ceil(slot / SLOTS_PER_EPOCH) + 2) * SLOTS_PER_EPOCH;
}

/** Which of the six story steps are active at `t` of a story slot. */
export function activeSteps(t: number): boolean[] {
  return [t >= 6.5 && t < 7.9, t >= 7.9 && t < 9.2, t >= 9.2, t < 3.9, t >= 3.9 && t < 6.5, false];
}
export const FF_STEPS = [false, false, false, false, false, true];
