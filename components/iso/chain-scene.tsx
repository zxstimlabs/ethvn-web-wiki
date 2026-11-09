'use client';

import type { BoxSpec, Pt } from '@/lib/hero/iso';
import { COS30 } from '@/lib/hero/iso';
import { backOut, easeInOut, easeOut, lerp, prog } from '@/lib/hero/timeline';
import { IsoFigure, type Step } from './figure';
import { Arrow, Badge, Box, Cube, Server, Shadow, Text } from './parts';

/**
 * How a blockchain holds together: each block records the previous block's
 * hash; every node keeps the same copy; editing an old block changes its hash,
 * breaks the link to the next block, and the other nodes reject that copy.
 */

const DURATION = 12;
const BLOCK: BoxSpec = { w: 36, d: 36, h: 32 };
const HALF = BLOCK.w * COS30;
const Y = 112;
const XS = [62, 162, 262, 362];
const HASHES = ['3a7f', '91c2', '5e08', 'c4d1'];
const PARENT_OF_FIRST = '08e2';
const FORGED = 'e05b';
const NODES: Pt[] = [
  [100, 252],
  [220, 252],
  [340, 252],
];
const TILE: BoxSpec = { w: 9, d: 9, h: 7 };
const tileAt = (node: Pt, k: number): Pt => [node[0] - 24 + k * 16, node[1] - 58];

const STEPS: Step[] = [
  { at: 0, title: 'Nối khối mới', body: 'Mỗi khối ghi mã băm (hash) của khối liền trước. Đó là sợi dây nối các khối thành chuỗi.' },
  { at: 2, title: 'Mọi nút có cùng bản sao', body: 'Khối mới được gửi tới mọi nút. Mỗi nút tự kiểm tra rồi thêm vào bản sao của mình.' },
  { at: 4.4, title: 'Thử sửa một khối cũ', body: 'Đổi một giao dịch làm mã băm của khối đó đổi theo. Khối sau vẫn ghi mã băm cũ, nên chuỗi bị đứt.' },
  { at: 7.4, title: 'Bản sửa bị loại', body: 'Các nút khác so bản sao này với chuỗi của mình, thấy không khớp và bỏ qua nó.' },
];

function render(t: number) {
  // the new block drops in, links up, then leaves again at the end of the loop
  const drop = easeOut(prog(t, 0.4, 1.1));
  const leave = prog(t, 11.2, 0.7);
  const newOpacity = Math.min(prog(t, 0.4, 0.4), 1 - leave);
  const link3 = easeInOut(prog(t, 1.5, 0.4)) * (1 - leave);
  // broadcast to the nodes
  const send = prog(t, 2.1, 0.8);
  const arrived = t >= 2.9;
  // someone edits block 1 on node A, until the copy is dropped
  const bad = prog(t, 4.6, 0.4) * (1 - prog(t, 9.8, 0.6));
  const broken = t >= 5.4 && t < 10.2;
  const compare = t >= 7.6 && t < 10.2;
  const verdict = backOut(prog(t, 8.2, 0.35)) * (1 - prog(t, 9.8, 0.4));

  const hashOf = (k: number) => (k === 1 && bad > 0.5 ? FORGED : HASHES[k]);

  return (
    <>
      {/* ground lines: chain → nodes, and node A ↔ the others while comparing */}
      {NODES.map((n, i) => (
        <Arrow key={i} from={[XS[3], Y + 20]} to={[n[0], n[1] - 50]} tone={send > 0 && send < 1 ? 'block' : 'lane'} head={false} opacity={0.35 + 0.65 * Math.sin(Math.PI * send)} />
      ))}
      {compare &&
        [1, 2].map((i) => <Arrow key={i} from={[NODES[0][0] + 18, NODES[0][1] - 6]} to={[NODES[i][0] - 18, NODES[i][1] - 6]} tone="bad" head={false} />)}

      {/* the chain */}
      {XS.map((x, k) => {
        const isNew = k === 3;
        const lift = isNew ? (1 - drop) * 50 : 0;
        const opacity = isNew ? newOpacity : 1;
        if (opacity <= 0) return null;
        const at: Pt = [x, Y - lift];
        return (
          <g key={k}>
            <Shadow at={[x, Y]} spec={BLOCK} opacity={opacity} />
            <Cube at={at} spec={BLOCK} opacity={opacity} />
            {k === 1 && bad > 0 && <Cube at={at} spec={BLOCK} tone="bad" opacity={bad} />}
            <Text x={x} y={Y - 60 - lift} className={k === 1 && bad > 0.5 ? 'iso-hash is-bad' : 'iso-hash'} opacity={opacity}>
              #{hashOf(k)}
            </Text>
            <Text x={x} y={Y + 36} className={k === 2 && broken ? 'iso-sub is-bad' : 'iso-sub'} opacity={opacity}>
              cha #{k === 0 ? PARENT_OF_FIRST : HASHES[k - 1]}
            </Text>
          </g>
        );
      })}
      {/* links: each arrow points back to the parent */}
      <Arrow from={[XS[0] - HALF - 4, Y - 16]} to={[16, Y - 16]} tone="block" head={false} opacity={0.5} />
      {[1, 2, 3].map((k) => {
        const from: Pt = [XS[k] - HALF - 3, Y - 16];
        const to: Pt = [XS[k - 1] + HALF + 3, Y - 16];
        if (k === 3) return <Arrow key={k} from={from} to={to} tone="block" k={link3} />;
        return <Arrow key={k} from={from} to={to} tone={k === 2 && broken ? 'bad' : 'block'} />;
      })}
      {broken && <Badge at={[(XS[1] + XS[2]) / 2, Y - 16]} ok={false} scale={backOut(prog(t, 5.4, 0.3))} />}
      <Text x={XS[1]} y={Y - 80} className="iso-note is-bad" opacity={Math.min(1, bad * 2) * (1 - prog(t, 9.8, 0.4))}>
        sửa 1 giao dịch
      </Text>

      {/* packets on their way to the nodes */}
      {send > 0 &&
        send < 1 &&
        NODES.map((n, i) => {
          const k = easeInOut(send);
          const p: Pt = [lerp(XS[3], tileAt(n, 3)[0], k), lerp(Y + 6, tileAt(n, 3)[1], k)];
          return <Box key={i} at={p} spec={TILE} tone="block" />;
        })}

      {/* the nodes and their copies */}
      {NODES.map((n, i) => (
        <g key={i}>
          <Server at={n} />
          {[0, 1, 2, 3].map((k) => {
            if (k === 3 && (!arrived || leave >= 1)) return null;
            const tone = i === 0 && k === 1 && bad > 0.5 ? 'bad' : 'block';
            return <Box key={k} at={tileAt(n, k)} spec={TILE} tone={tone} opacity={k === 3 ? 1 - leave : 1} />;
          })}
          <Text x={n[0]} y={n[1] + 32} className="iso-sub">
            Nút {'ABC'[i]}
          </Text>
          {verdict > 0 && <Badge at={[n[0] + 22, n[1] - 30]} ok={i !== 0} scale={verdict} />}
        </g>
      ))}
      <Text x={NODES[0][0]} y={NODES[0][1] + 46} className="iso-note is-bad" opacity={verdict}>
        không khớp
      </Text>
    </>
  );
}

export function ChainScene() {
  return (
    <IsoFigure
      title="Chuỗi khối: mỗi khối ghi mã băm của khối trước; sửa một khối cũ làm đứt chuỗi và các nút khác bỏ qua bản bị sửa"
      viewBox="0 0 440 300"
      duration={DURATION}
      poster={3.6}
      steps={STEPS}
      render={render}
    />
  );
}
