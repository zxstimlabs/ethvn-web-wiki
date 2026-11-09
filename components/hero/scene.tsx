import { type ReactNode, memo } from 'react';
import { cn } from '@/lib/cn';
import { type BoxSpec, COS30, type Pt, boxEdges, boxFaces, leftFace, leftFaceText, rectOn, rightFace, shadow, toPath, toPoints } from '@/lib/hero/iso';
import { BUILDERS as BUILDER_COUNT, LAYERS, VOTERS } from '@/lib/hero/timeline';
import { INFO, type InfoText, SCENE_DESC, SCENE_TITLE } from './content';
import {
  BENCH,
  type Lane,
  type LabelSpec,
  type Layout,
  type ModKey,
  PEER,
  PHONE,
  RELAY_MODS,
  RELAY_MODULE,
  RELAY_PLATFORM,
  SLAB_H,
  TEMPLATE,
  TOKEN,
  VAL,
  up,
} from './layout';

// ── drawing primitives ───────────────────────────────────────────────────

function Box({ at, spec, className, children }: { at: Pt; spec: BoxSpec; className?: string; children?: ReactNode }) {
  const f = boxFaces(at[0], at[1], spec);
  return (
    <g className={className}>
      <polygon className="f-left" points={toPoints(f.left)} />
      <polygon className="f-right" points={toPoints(f.right)} />
      <polygon className="f-top" points={toPoints(f.top)} />
      {children}
    </g>
  );
}

function Shadow({ at, spec }: { at: Pt; spec: BoxSpec }) {
  return <polygon className="shade" points={shadow(at[0], at[1], spec)} />;
}

function BlockCube({ spec, at = [0, 0], tone = 'tone-block' }: { spec: BoxSpec; at?: Pt; tone?: string }) {
  const L = leftFace(at[0], at[1], spec);
  const R = rightFace(at[0], at[1], spec);
  const stripes: string[] = [];
  for (let k = 1; k < 5; k++) {
    const v = (k * spec.h) / 5;
    stripes.push(toPath([L(0, v), L(spec.w, v)]), toPath([R(0, v), R(spec.d, v)]));
  }
  return (
    <Box at={at} spec={spec} className={tone}>
      <path className="stripe" d={stripes.join(' ')} />
    </Box>
  );
}

function FaceLabel({ at, spec, text }: { at: Pt; spec: BoxSpec; text: string }) {
  return (
    <text className="face-lbl" textAnchor="middle" transform={leftFaceText(at[0], at[1], spec, spec.w / 2, spec.h / 2 - 2.5)}>
      {text}
    </text>
  );
}

function Label({ x, y, title, sub, anchor = 'middle' }: LabelSpec) {
  return (
    <text x={x} y={y} textAnchor={anchor} className="lbl">
      <tspan x={x} className="lbl-title">
        {title}
      </tspan>
      {sub && (
        <tspan x={x} dy={12} className="lbl-sub">
          {sub}
        </tspan>
      )}
    </text>
  );
}

/** The arrow from a chain block back to its parent. */
function Link({ L }: { L: Layout }) {
  const x1 = -L.half - 3;
  const x2 = -L.chain.step + L.half + 3;
  return (
    <>
      <line className="link" x1={x1} y1={L.linkY} x2={x2 + 4} y2={L.linkY} />
      <path className="link-head" d={`M${x2} ${L.linkY} l5 -3 v6 z`} />
    </>
  );
}

function Check({ x, y, r }: { x: number; y: number; r: number }) {
  return <path className="check" d={`M${x - r * 0.45} ${y} l${r * 0.3} ${r * 0.32} l${r * 0.6} ${-r * 0.62}`} />;
}

function Token({ k, tone = 'tone-mine', opacity }: { k: string; tone?: string; opacity?: number }) {
  return (
    <g data-k={k} opacity={opacity}>
      <Box at={[0, 0]} spec={TOKEN} className={tone} />
    </g>
  );
}

function InfoButton({ id, group, title, kind, at }: InfoText & { at: Pt }) {
  const half = kind === 'rel' ? 7 : 5;
  const arm = kind === 'rel' ? 3.5 : 2.5;
  return (
    <g
      data-info={id}
      data-active="false"
      className={cn('info', `info-${kind}`, `info-${group}`)}
      transform={`translate(${at[0].toFixed(1)} ${at[1].toFixed(1)})`}
      role="button"
      tabIndex={0}
      aria-haspopup="dialog"
      aria-label={`${kind === 'rel' ? 'Giải thích liên hệ' : 'Chi tiết'}: ${title}`}
    >
      <rect className="info-hit" x={-13} y={-13} width={26} height={26} />
      <rect className="info-box" x={-half} y={-half} width={half * 2} height={half * 2} />
      <path className="info-plus" d={`M${-arm} 0 H${arm} M0 ${-arm} V${arm}`} />
    </g>
  );
}

// ── parts ────────────────────────────────────────────────────────────────

function Wallet({ L }: { L: Layout }) {
  const R = rightFace(L.wallet[0], L.wallet[1], PHONE);
  return (
    <g data-k="wallet" data-send="false" className="wallet">
      <Shadow at={L.wallet} spec={PHONE} />
      <Box at={L.wallet} spec={PHONE} className="tone-device">
        <polygon className="screen" points={toPoints(rectOn(R, 2.5, 5, PHONE.d - 5, PHONE.h - 10))} />
      </Box>
    </g>
  );
}

/** A home staker's node: execution layer (RPC, mempool, P2P) + consensus layer (validator, beacon) + MEV-Boost. */
function Node({ L }: { L: Layout }) {
  const bus = (keys: ModKey[]) => toPath(keys.map((k) => up(L.modAt(k), L.platform.h)));
  const modules = [...L.mods].sort((a, b) => L.modAt(a.key)[1] - L.modAt(b.key)[1]);
  return (
    <g>
      <Shadow at={L.node} spec={L.platform} />
      <Box at={L.node} spec={L.platform} className="tone-device" />
      <path className="bus" d={`${bus(['rpc', 'mempool', 'p2p'])} ${bus(['validator', 'beacon', 'mev'])}`} />
      {modules.map((m) => {
        const at = L.modAt(m.key);
        return (
          <g key={m.key} data-k={`mod-${m.key}`} data-state="idle" className="module">
            <Box at={at} spec={L.module} className={m.tone} />
            <FaceLabel at={at} spec={L.module} text={m.label} />
            {m.key === 'mempool' && <Token k="mempool-tx" />}
          </g>
        );
      })}
    </g>
  );
}

function Peer({ L, i }: { L: Layout; i: number }) {
  const at = L.peers[i];
  const F = leftFace(at[0], at[1], PEER);
  return (
    <g>
      <Shadow at={at} spec={PEER} />
      <Box at={at} spec={PEER} className="tone-device">
        {[7, 17].map((v) => (
          <polygon key={v} className="rack" points={toPoints(rectOn(F, 3, v, 14, 6))} />
        ))}
      </Box>
      <Token k={`peer-tx-${i}`} />
    </g>
  );
}

function Builder({ L, i }: { L: Layout; i: number }) {
  const at = L.builders[i];
  return (
    <g data-k={`builder-${i}`} data-win="false" className="builder">
      <Shadow at={at} spec={BENCH} />
      <Box at={at} spec={BENCH} className="tone-device" />
      <FaceLabel at={at} spec={BENCH} text={`B${i + 1}`} />
      {Array.from({ length: LAYERS }, (_, n) => (
        <g key={n} data-k={`slab-${i}-${n}`}>
          <Box at={at} spec={{ w: TEMPLATE.w, d: TEMPLATE.d, h: SLAB_H, z: BENCH.h + n * SLAB_H }} className={n === 0 ? 'tone-mine' : 'tone-tx'} />
        </g>
      ))}
      <path className="ghost" d={boxEdges(at[0], at[1], TEMPLATE)} />
    </g>
  );
}

/** A MEV-Boost relay node, run by a third party: the relay software plus a beacon node to check and publish blocks. */
function Relay({ L }: { L: Layout }) {
  const mods = [...RELAY_MODS].sort((a, b) => L.relayModAt(a.y)[1] - L.relayModAt(b.y)[1]);
  return (
    <g>
      <Shadow at={L.relay} spec={RELAY_PLATFORM} />
      <Box at={L.relay} spec={RELAY_PLATFORM} className="tone-device" />
      {mods.map((m) => {
        const at = L.relayModAt(m.y);
        return (
          <g key={m.key}>
            <Box at={at} spec={RELAY_MODULE} className={m.tone} />
            <FaceLabel at={at} spec={RELAY_MODULE} text={m.label} />
          </g>
        );
      })}
    </g>
  );
}

function Validator({ L, i }: { L: Layout; i: number }) {
  const at = L.validators[i];
  const F = leftFace(at[0], at[1], VAL);
  return (
    <g data-k={`val-${i}`} data-state="idle" className="validator">
      <Shadow at={at} spec={VAL} />
      <Box at={at} spec={VAL} className="tone-device">
        <polygon className="eth" points={toPoints([F(11, 2), F(14, 7), F(11, 12), F(8, 7)])} />
      </Box>
    </g>
  );
}

/** Bids the relay has received. */
function BidBoard({ L }: { L: Layout }) {
  const { x, y, anchor } = L.board;
  return (
    <g className="lbl">
      <text x={x} y={y} textAnchor={anchor} className="board-title">
        giá thầu (ETH)
      </text>
      {Array.from({ length: BUILDER_COUNT }, (_, i) => (
        <text key={i} data-k={`bid-${i}`} data-win="false" x={x} y={y + 14 + i * 13} textAnchor={anchor} className="board-row" />
      ))}
    </g>
  );
}

/** Votes for the current epoch's checkpoint, as a share of all staked ETH. */
function Gauge({ L }: { L: Layout }) {
  const { x, y, w, statusY } = L.gauge;
  return (
    <g data-k="gauge" data-done="false" className="gauge">
      <text data-k="gauge-title" x={x} y={y - 8} className="gauge-title" />
      <rect className="gauge-track" x={x} y={y} width={w} height={7} />
      <rect data-k="gauge-fill" className="gauge-fill" x={x} y={y} width={0} height={7} />
      <line className="gauge-tick" x1={x + (w * 2) / 3} y1={y - 4} x2={x + (w * 2) / 3} y2={y + 11} />
      <text className="gauge-mark" x={x + (w * 2) / 3} y={y + 21} textAnchor="middle">
        2/3
      </text>
      <text data-k="gauge-pct" x={x + w + 8} y={y + 7} className="gauge-pct" />
      <text data-k="gauge-status" x={x} y={y + statusY} className="gauge-status" />
    </g>
  );
}

function FFStatus({ L }: { L: Layout }) {
  const { x, y, panel } = L.ff;
  return (
    <g data-k="ff" opacity={0} className="lbl ff" pointerEvents="none">
      {panel && <rect className="ff-panel" x={x - 8} y={y - 16} width={panel.w} height={panel.h} />}
      <text data-k="ff-line1" x={x} y={y} className="ff-title" />
      <text data-k="ff-line2" x={x} y={y + 18} className="ff-status" />
      <text data-k="ff-line3" x={x} y={y + 34} className="ff-status" />
    </g>
  );
}

// ── the static scene (server-renderable; the engine only mutates attributes) ─

function Scene({ L }: { L: Layout }) {
  const network: { depth: number; node: ReactNode }[] = [
    { depth: L.wallet[1], node: <Wallet key="wallet" L={L} /> },
    { depth: L.node[1], node: <Node key="node" L={L} /> },
    ...L.peers.map((p, i) => ({ depth: p[1], node: <Peer key={`p${i}`} L={L} i={i} /> })),
    ...L.builders.map((b, i) => ({ depth: b[1], node: <Builder key={`b${i}`} L={L} i={i} /> })),
    { depth: L.relay[1], node: <Relay key="relay" L={L} /> },
  ].sort((a, b) => a.depth - b.depth);
  const committee = L.validators.map((v, i) => ({ depth: v[1], i })).sort((a, b) => a.depth - b.depth);

  const { chain, final, justified, half, linkY, tagY } = L;
  const valTop = L.modTop('validator');
  const [fx, fy, fw, fh] = L.frame;
  const bg = { x: fx - 200, y: fy - 146, width: fw + 400, height: fh + 286 };
  const jrEnd = chain.jrToOldest ? L.chainX(chain.slots - 1) - half - 4 : L.chainX(chain.slots) + half;
  const lane = (l: Lane) => <path key={l.id} data-k={`lane-${l.id}`} data-on={l.initial} className="lane" d={toPath([l.from, l.to])} />;

  return (
    <>
      <title id={`eth-hero-title-${L.name}`}>{SCENE_TITLE}</title>
      <desc id={`eth-hero-desc-${L.name}`}>{SCENE_DESC}</desc>
      <defs>
        <pattern id={`eth-hero-grid-${L.name}`} width={80 * COS30} height={40} patternUnits="userSpaceOnUse" x={chain.headX} y={chain.y}>
          <path className="grid-line" d={`M0 0 L${80 * COS30} 40 M0 40 L${80 * COS30} 0`} />
        </pattern>
        <radialGradient id={`eth-hero-vignette-${L.name}`} cx="0.5" cy="0.5" r="0.62">
          <stop offset="0.45" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </radialGradient>
        <mask id={`eth-hero-fade-${L.name}`} maskContentUnits="userSpaceOnUse">
          <rect {...bg} fill={`url(#eth-hero-vignette-${L.name})`} />
        </mask>
      </defs>

      <rect {...bg} fill={`url(#eth-hero-grid-${L.name})`} mask={`url(#eth-hero-fade-${L.name})`} />

      {/* the network: dims during the fast-forward */}
      <g data-k="net">
        {L.netLanes.map(lane)}
        {network.map((o) => o.node)}
        <Label {...L.labels.wallet} />
        <Label {...L.labels.node} />
        <Label {...L.labels.peers} />
        <Label {...L.labels.builders} />
        <Label {...L.labels.relay} />
        <BidBoard L={L} />
      </g>

      {/* the committee keeps voting during the fast-forward */}
      <g>
        {L.voteLanes.map(lane)}
        {committee.map(({ i }) => (
          <Validator key={i} L={L} i={i} />
        ))}
        <Label {...L.labels.committee} />
      </g>

      {/* chain row: finalized checkpoint · justified checkpoint · most recent blocks */}
      <g data-k="chainrow">
        <ellipse data-k="ring-head" className="ring" data-tone="block" cx={L.head[0]} cy={L.head[1]} rx={0} ry={0} opacity={0} />
        <line className="gapline" x1={final[0] + half + 4} y1={chain.y + linkY} x2={justified[0] - half - 4} y2={chain.y + linkY} />
        <text data-k="gap-fj" className="tag" x={(final[0] + justified[0]) / 2} y={chain.y + chain.gapY} textAnchor="middle" />
        {jrEnd > justified[0] + half + 4 && (
          <line className="gapline" x1={justified[0] + half + 4} y1={chain.y + linkY} x2={jrEnd} y2={chain.y + linkY} />
        )}
        <text data-k="gap-jr" className="tag" x={(justified[0] + L.chainX(chain.slots - 1)) / 2} y={chain.y + chain.gapY} textAnchor="middle" />

        <g transform={`translate(${final[0]} ${final[1]})`}>
          <g data-k="final-inner">
            <Shadow at={[0, 0]} spec={L.block} />
            <BlockCube spec={L.block} tone="tone-final" />
            <circle className="final-dot" cx={0} cy={-L.block.h} r={7} />
            <Check x={0} y={-L.block.h} r={7} />
          </g>
          <text className="tag tag-final" x={0} y={tagY.title} textAnchor="middle">
            {chain.finalTag}
          </text>
          <text data-k="final-slot" className="tag" x={0} y={tagY.slot} textAnchor="middle" />
          <text data-k="final-ago" className="tag" x={chain.agoX} y={chain.agoY} textAnchor={chain.agoAnchor} />
        </g>

        <g transform={`translate(${justified[0]} ${justified[1]})`}>
          <g data-k="just-inner">
            <Shadow at={[0, 0]} spec={L.block} />
            <BlockCube spec={L.block} tone="tone-just" />
            <text className="just-mark" x={0} y={-L.block.h + 3} textAnchor="middle">
              2/3
            </text>
          </g>
          <text className="tag tag-just" x={0} y={tagY.title} textAnchor="middle">
            {chain.justifiedTag}
          </text>
          <text data-k="just-slot" className="tag" x={0} y={tagY.slot} textAnchor="middle" />
        </g>

        {Array.from({ length: chain.slots }, (_, k) => (
          <g key={k} data-k={`chain-${k}`} transform={`translate(${L.chainX(k)} ${chain.y})`}>
            <Shadow at={[0, 0]} spec={L.block} />
            <g data-k={k === 0 ? 'link-0' : undefined}>
              <Link L={L} />
            </g>
            <BlockCube spec={L.block} />
            <text data-k={`tag-${k}`} className={cn('tag', k === 0 && 'tag-head', k > 0 && !chain.midTags && 'hidden')} x={0} y={tagY.slot} textAnchor="middle" />
          </g>
        ))}

        <Label {...L.labels.chain} />
        <g data-k="badge" opacity={1} className="lbl">
          <text x={L.badge.x} y={L.badge.y} textAnchor={L.badge.anchor} className="badge-title">
            chứng thực
          </text>
          <text x={L.badge.x} y={L.badge.y + 13} textAnchor={L.badge.anchor} className="badge-count">
            <tspan data-k="badge-count">
              {VOTERS}/{VOTERS}
            </tspan>
          </text>
        </g>
        <Gauge L={L} />
      </g>

      {/* fast-forward status, over the dimmed network (or above the buttons, on a panel) */}
      {!L.ff.panel && <FFStatus L={L} />}

      {/* moving things */}
      <Token k="tx-main" opacity={0} />
      {L.peers.map((_, i) => (
        <Token key={i} k={`tx-peer-${i}`} opacity={0} />
      ))}
      {L.builders.map((_, i) => (
        <Token key={i} k={`tx-builder-${i}`} opacity={0} />
      ))}
      {L.builders.map((_, i) => (
        <g key={i} data-k={`bidpkt-${i}`} opacity={0}>
          <path className="bid-dot" d="M0 -4 L7 0 L0 4 L-7 0 Z" />
        </g>
      ))}
      {Array.from({ length: VOTERS }, (_, i) => (
        <g key={i} data-k={`vote-${i}`} opacity={0}>
          <circle className="vote-dot" r={5} />
          <Check x={0} y={0} r={5} />
        </g>
      ))}
      <g data-k="msg" data-tone="amber" opacity={0} className="msg">
        <path className="msg-dot" d="M0 -4.5 L8 0 L0 4.5 L-8 0 Z" />
        <text data-k="msg-text" x={0} y={-10} textAnchor="middle" className="msg-text" />
      </g>
      <g data-k="pkt" opacity={0}>
        <BlockCube spec={L.block} />
      </g>
      <g data-k="seal" opacity={0} transform={`translate(${valTop[0] + 18} ${valTop[1] - 10})`}>
        <g data-k="seal-inner">
          <circle className="seal-dot" r={6.5} />
          <path className="check" d="M-3 0.5 l2 2 l4 -4.5" />
          <text className="seal-text" x={10} y={3.5}>
            ký
          </text>
        </g>
      </g>
      <g data-k="ptag" opacity={0} className="lbl">
        <text className="ptag-line" x={L.ptag.x} y={L.ptag.y} textAnchor={L.ptag.anchor}>
          {L.ptag.text}
        </text>
      </g>

      {/* "+" buttons on top of everything, so moving packets never block a click */}
      <g>
        {INFO.map((r) => (
          <InfoButton key={r.id} {...r} at={L.info[r.id]} />
        ))}
      </g>
      {L.ff.panel && <FFStatus L={L} />}
    </>
  );
}

/** Static: re-rendering the hero (e.g. opening a popup) must never touch the SVG the engine drives. */
export const StaticScene = memo(Scene);
