/**
 * Timeline for the home hero: one block's story, from the transaction to
 * finality. Every visual is a pure function of a slot number and `t` (seconds
 * into that slot), so any frame can be drawn on its own.
 *
 * The story runs on its own clock, starting at step 1 whenever the hero
 * appears; it is not synced to the timing of mainnet's slots. Only the slot
 * numbers come from mainnet, read when each loop starts.
 *
 * Schedule inside a slot (a home staker's node whose validator is the
 * proposer of the next slot):
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
 * One loop (see `STORY`): from 6.4 s into slot S (steps 1–3: send, spread,
 * auction) to 6.4 s into slot S + 1 (steps 4–5: propose, attest), then a
 * fast-forward until the block of S + 1 is finalized (step 6).
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

/** `t` seconds into `slot`. */
export function at(slot: number, t: number): SlotClock {
  return { slot, t, epoch: Math.floor(slot / SLOTS_PER_EPOCH), slotInEpoch: slot % SLOTS_PER_EPOCH };
}

/** Mainnet's current slot: only used to label the story with realistic slot numbers. */
export function mainnetSlot(ms = Date.now()): number {
  return Math.floor((ms / 1000 - GENESIS_TIME) / SLOT_SECONDS);
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
  votes: { start: 4.0, stagger: 0.15, dur: 0.7 },
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

// ── loop: the story in real time, then a fast-forward to finality ───────

/**
 * The story: from `start` s into slot S, just before the wallet sends (step 1),
 * to `end` s into slot S + 1, once the committee has attested to the new block
 * (step 5). It is one continuous stretch of time, so the transaction sent in
 * slot S is the one the block of S + 1 carries.
 */
export const STORY = { start: 6.4, end: 6.4 } as const;
export const STORY_LEN = SLOT_SECONDS - STORY.start + STORY.end;

export const FF = {
  /** network dims, overlay appears */
  dim: 0.6,
  /** simulated slots advance over this window (eased) */
  run: [0.6, 10.0],
  /** chain row fades out, then back in showing the next story's opening */
  out: 11.4,
  back: 11.6,
  len: 12,
} as const;

/** One loop: the story, then the fast-forward. */
export const CYCLE = STORY_LEN + FF.len;
/** From here the fast-forward shows the next loop's opening, so its slot number must be known. */
export const HANDBACK = STORY_LEN + FF.back;

/** Slot and time inside the story for `tau` seconds into the loop (tau < STORY_LEN). */
export function storyClock(base: number, tau: number): SlotClock {
  const u = STORY.start + tau;
  return u < SLOT_SECONDS ? at(base, u) : at(base + 1, u - SLOT_SECONDS);
}

/**
 * First slot at whose start `slot` is finalized in a healthy network: the
 * finalized checkpoint must reach it, so it takes 64–96 slots (13–19 min).
 */
export function finalitySlot(slot: number): number {
  return (Math.ceil(slot / SLOTS_PER_EPOCH) + 2) * SLOTS_PER_EPOCH;
}

/** Which of the six story steps are active at `t` of a slot. */
export function activeSteps(t: number): boolean[] {
  return [t >= STORY.start && t < 7.9, t >= 7.9 && t < 9.2, t >= 9.2, t < 3.9, t >= 3.9 && t < STORY.start, false];
}
export const FF_STEPS = [false, false, false, false, false, true];
