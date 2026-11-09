'use client';

import type { BoxSpec, Pt } from '@/lib/hero/iso';
import { iso } from '@/lib/hero/iso';
import { backOut, easeInOut, lerp, prog } from '@/lib/hero/timeline';
import { IsoFigure, type Step } from './figure';
import { Arrow, Badge, Box, Cube, Phone, Pill, Server, Shadow, Text } from './parts';

/**
 * A node: two programs (execution + consensus) on one machine. It gets blocks
 * from its peers, re-runs every transaction itself, keeps the valid ones and
 * drops a bad one. A wallet can ask its own node instead of trusting someone
 * else's.
 */

const DURATION = 12;
const NODE: Pt = [214, 196];
const PLATFORM: BoxSpec = { w: 96, d: 72, h: 8 };
const LAYER: BoxSpec = { w: 50, d: 40, h: 18 };
const EXEC_AT: Pt = iso(NODE[0], NODE[1], 0, 0, 0);
const PEERS: Pt[] = [
  [70, 120],
  [372, 116],
  [384, 238],
];
const BLOCK: BoxSpec = { w: 18, d: 18, h: 16 };
const CHAIN_Y = 52;
const CHAIN_XS = [150, 196, 242];
const PHONE: Pt = [64, 262];
const TOP: Pt = [NODE[0], NODE[1] - PLATFORM.h - LAYER.h * 2 - 26];

const STEPS: Step[] = [
  { at: 0, title: 'Hai phần mềm, một máy', body: 'Một nút gồm phần mềm lớp thực thi (chạy giao dịch) và phần mềm lớp đồng thuận (theo dõi khối và phiếu bầu), chạy cùng nhau.' },
  { at: 1.6, title: 'Nhận khối từ các nút khác', body: 'Nút nối với vài chục nút khác và nhận khối mới qua mạng ngang hàng, không qua máy chủ trung tâm nào.' },
  { at: 4.4, title: 'Tự kiểm tra, không tin ai', body: 'Nút tự chạy lại mọi giao dịch. Khối hợp lệ thì nối vào bản sao của mình; khối sai thì bỏ, dù ai gửi tới.' },
  { at: 8.4, title: 'Ví hỏi nút của bạn', body: 'Ví lấy số dư và gửi giao dịch qua một nút. Dùng nút của mình thì không phải tin nhà cung cấp nào. Chạy nút không cần ETH.' },
];

/** A block flying from peer i to the node during [start, start + 1.1]. */
function incoming(t: number, i: number, start: number) {
  const k = prog(t, start, 1.1);
  if (k <= 0 || k >= 1) return null;
  const e = easeInOut(k);
  const from = PEERS[i];
  return [lerp(from[0], TOP[0], e), lerp(from[1] - 30, TOP[1], e) - Math.sin(Math.PI * e) * 24] as Pt;
}

function render(t: number) {
  const fade = 1 - prog(t, 11.4, 0.6);
  const good = incoming(t, 0, 1.8);
  const bad = incoming(t, 1, 4.6);
  const checking = (t >= 2.9 && t < 3.9) || (t >= 5.7 && t < 6.7);
  const added = t >= 3.9;
  const rejected = backOut(prog(t, 6.5, 0.35)) * (1 - prog(t, 8.2, 0.3));
  const ask = prog(t, 8.6, 0.9);
  const answer = prog(t, 9.6, 0.9);

  return (
    <g opacity={fade < 1 ? 0.3 + 0.7 * fade : 1}>
      {/* the node's own copy of the chain */}
      <Text x={CHAIN_XS[0] - 34} y={CHAIN_Y - 4} className="iso-sub" anchor="end">
        bản sao
      </Text>
      {CHAIN_XS.map((x, i) => (
        <g key={x}>
          <Cube at={[x, CHAIN_Y]} spec={BLOCK} />
          {i > 0 && <Arrow from={[x - 18, CHAIN_Y - 8]} to={[CHAIN_XS[i - 1] + 18, CHAIN_Y - 8]} tone="block" />}
        </g>
      ))}
      {added && (
        <g opacity={prog(t, 3.9, 0.4)}>
          <Cube at={[CHAIN_XS[2] + 46, CHAIN_Y]} spec={BLOCK} />
          <Arrow from={[CHAIN_XS[2] + 28, CHAIN_Y - 8]} to={[CHAIN_XS[2] + 18, CHAIN_Y - 8]} tone="block" />
        </g>
      )}

      {/* peers */}
      {PEERS.map((p, i) => (
        <g key={i}>
          <Arrow from={[p[0], p[1] - 20]} to={[NODE[0], NODE[1] - 40]} head={false} tone={(i === 0 && good) || (i === 1 && bad) ? 'block' : 'lane'} opacity={0.6} />
          <Server at={p} spec={{ w: 20, d: 20, h: 26 }} />
        </g>
      ))}
      <Text x={PEERS[1][0]} y={PEERS[1][1] + 30} className="iso-sub">
        nút khác
      </Text>

      {/* the node: execution below, consensus on top */}
      <Shadow at={NODE} spec={PLATFORM} />
      <Box at={NODE} spec={PLATFORM} />
      <Box at={EXEC_AT} spec={{ ...LAYER, z: PLATFORM.h }} tone={checking ? 'tx' : 'device'} />
      <Box at={EXEC_AT} spec={{ ...LAYER, z: PLATFORM.h + LAYER.h }} tone="block" />
      <Text x={NODE[0] + 70} y={NODE[1] - 38} className="iso-sub" anchor="start">
        lớp đồng thuận
      </Text>
      <Text x={NODE[0] + 70} y={NODE[1] - 20} className="iso-sub" anchor="start">
        lớp thực thi
      </Text>
      <Text x={NODE[0]} y={NODE[1] + 58}>
        Nút của bạn
      </Text>

      {/* blocks arriving: one good, one bad */}
      {good && <Cube at={good} spec={BLOCK} />}
      {bad && <Cube at={bad} spec={BLOCK} tone="bad" />}
      {checking && (
        <Pill at={[NODE[0], NODE[1] + 78]} text="chạy lại giao dịch…" tone="tx" />
      )}
      <Badge at={[NODE[0], TOP[1] - 6]} ok scale={backOut(prog(t, 3.6, 0.3)) * (1 - prog(t, 4.4, 0.3))} r={9} />
      <Badge at={[NODE[0], TOP[1] - 6]} ok={false} scale={rejected} r={9} />
      <Text x={NODE[0] + 16} y={TOP[1] - 2} className="iso-note is-bad" anchor="start" opacity={rejected}>
        khối sai: bỏ
      </Text>

      {/* a wallet asks the node */}
      <Phone at={PHONE} lit={ask > 0 && ask < 1} />
      <Text x={PHONE[0] + 10} y={PHONE[1] + 34}>
        Ví
      </Text>
      {ask > 0 && ask < 1 && <Pill at={[lerp(PHONE[0] + 20, NODE[0] - 60, easeInOut(ask)), lerp(PHONE[1] - 40, NODE[1] - 6, easeInOut(ask))]} text="số dư?" tone="tx" />}
      {answer > 0 && answer < 1 && (
        <Pill at={[lerp(NODE[0] - 60, PHONE[0] + 20, easeInOut(answer)), lerp(NODE[1] - 6, PHONE[1] - 40, easeInOut(answer))]} text="1,2 ETH ✓" tone="ok" />
      )}
      {t >= 10.5 && (
        <Text x={PHONE[0] + 30} y={PHONE[1] - 48} className="iso-note is-ok" anchor="start" opacity={1 - prog(t, 11.2, 0.3)}>
          tự kiểm chứng
        </Text>
      )}
    </g>
  );
}

export function NodeScene() {
  return (
    <IsoFigure
      title="Nút: phần mềm lớp thực thi và lớp đồng thuận nhận khối từ các nút khác, tự chạy lại để kiểm tra, bỏ khối sai, và trả lời ví của bạn"
      viewBox="0 0 440 300"
      duration={DURATION}
      poster={6.9}
      steps={STEPS}
      render={render}
    />
  );
}
