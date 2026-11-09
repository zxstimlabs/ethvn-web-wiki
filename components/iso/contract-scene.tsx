'use client';

import type { BoxSpec, Pt } from '@/lib/hero/iso';
import { COS30, leftFace, toPath } from '@/lib/hero/iso';
import { backOut, easeInOut, lerp, prog } from '@/lib/hero/timeline';
import { IsoFigure, type Step } from './figure';
import { Arrow, Badge, Box, Card, Phone, Server, Shadow, Text } from './parts';

/**
 * A smart contract: code and data at an address. A transaction calls it; every
 * node runs the same code and gets the same result; a call that breaks the
 * code's rules is reverted and the data stays as it was.
 */

const DURATION = 12;
const CONTRACT: Pt = [236, 176];
const SPEC: BoxSpec = { w: 56, d: 56, h: 46 };
const CONTRACT_TOP: Pt = [CONTRACT[0], CONTRACT[1] - SPEC.h - 46];
const PHONE: Pt = [54, 252];
const NODES: Pt[] = [
  [330, 266],
  [372, 266],
  [414, 266],
];
const NODE_SPEC: BoxSpec = { w: 18, d: 18, h: 24 };
const TX: BoxSpec = { w: 8, d: 8, h: 8 };

const CODE = ['nếu số dư < số: hủy', 'trừ số dư người gửi', 'cộng số dư người nhận'];

const STEPS: Step[] = [
  { at: 0, title: 'Mã nằm trên chuỗi', body: 'Hợp đồng thông minh là một chương trình kèm dữ liệu, đặt tại một địa chỉ trên Ethereum. Ai cũng đọc được mã.' },
  { at: 1.2, title: 'Gọi bằng giao dịch', body: 'An gửi một giao dịch tới địa chỉ của hợp đồng, kèm lệnh: chuyển 30 USDC cho Bình.' },
  { at: 2.8, title: 'Mọi nút chạy như nhau', body: 'Mỗi nút chạy cùng đoạn mã và ra cùng kết quả. Số dư được cập nhật mà không cần ai duyệt.' },
  { at: 6.4, title: 'Sai luật là hủy', body: 'Chuyển nhiều hơn số dư thì mã dừng lại và hoàn tác. Dữ liệu giữ nguyên, nhưng phí gas cho phần đã chạy vẫn mất.' },
];

function render(t: number) {
  const second = t >= 6.4;
  const call = second ? 'chuyển(Bình, 500)' : 'chuyển(Bình, 30)';
  const hop = second ? prog(t, 6.6, 1.2) : prog(t, 1.2, 1.2);
  const run = second ? prog(t, 8, 0.8) : prog(t, 2.8, 1);
  const updated = t >= 3.8 && t < 11.4;
  const fresh = t >= 3.8 && t < 4.6;
  const ok = backOut(prog(t, 3.4, 0.3)) * (1 - prog(t, 5.8, 0.3));
  const bad = backOut(prog(t, 8.6, 0.3)) * (1 - prog(t, 11.2, 0.4));
  const reverted = t >= 8.4 && t < 11.4;

  // the code line running now: the check, then the two updates (only the check, on the bad call)
  let active: number | undefined;
  if (!second && run > 0 && run < 1) active = Math.min(2, Math.floor(run * 3));
  const failing = second && t >= 8 && t < 11.4 ? 0 : undefined;

  const F = leftFace(CONTRACT[0], CONTRACT[1], SPEC);
  const code = [10, 18, 26, 34].map((v, i) => toPath([F(8, SPEC.h - v), F(8 + [34, 24, 40, 18][i], SPEC.h - v)])).join(' ');
  const half = (SPEC.w * COS30) / 1;

  return (
    <>
      <Card x={12} y={12} w={162} title="MÃ · chuyển(tới, số)" rows={CODE} active={active} highlight={failing} />

      {/* the contract */}
      <Shadow at={CONTRACT} spec={SPEC} />
      <Box at={CONTRACT} spec={SPEC} tone={reverted ? 'bad' : 'block'}>
        <path className="vent" d={code} />
      </Box>
      <Text x={CONTRACT[0]} y={CONTRACT[1] + 66}>
        Hợp đồng token
      </Text>
      <Text x={CONTRACT[0]} y={CONTRACT[1] + 80} className="iso-hash">
        0xC0de…7a1F
      </Text>
      <Text x={CONTRACT[0]} y={CONTRACT_TOP[1] - 16} className="iso-note is-bad" opacity={reverted ? 1 : 0}>
        hủy · hoàn tác
      </Text>

      {/* its data */}
      <Card
        x={304}
        y={92}
        w={126}
        title="DỮ LIỆU"
        rows={[updated ? 'An      70 USDC' : 'An     100 USDC', updated ? 'Bình    80 USDC' : 'Bình    50 USDC']}
        active={fresh ? 0 : undefined}
      />

      {/* the caller */}
      <Phone at={PHONE} lit={hop > 0 && hop < 0.3} />
      <Text x={PHONE[0] + 10} y={PHONE[1] + 36}>
        Ví của An
      </Text>
      <Card x={12} y={150} w={140} rows={[call]} highlight={second && t >= 8.4 && t < 11.4 ? 0 : undefined} />
      {hop > 0 && hop < 1 && (
        <Box
          at={[
            lerp(PHONE[0] + 6, CONTRACT_TOP[0], easeInOut(hop)),
            lerp(PHONE[1] - 46, CONTRACT_TOP[1] + 4, easeInOut(hop)) - Math.sin(Math.PI * easeInOut(hop)) * 34,
          ]}
          spec={TX}
          tone="tx"
        />
      )}

      {/* every node runs the same code */}
      {NODES.map((n, i) => (
        <g key={i}>
          {run > 0 && run < 1 && (
            <Arrow from={[CONTRACT[0] + half - 4, CONTRACT[1] - 20]} to={[n[0], n[1] - 40]} tone={second ? 'bad' : 'tx'} head={false} opacity={Math.sin(Math.PI * run)} />
          )}
          <Server at={n} spec={NODE_SPEC} />
          <Badge at={[n[0], n[1] - 50]} ok scale={ok} r={7} />
          <Badge at={[n[0], n[1] - 50]} ok={false} scale={bad} r={7} />
        </g>
      ))}
      <Text x={NODES[1][0]} y={NODES[1][1] + 28} className="iso-sub">
        mọi nút chạy cùng mã
      </Text>
    </>
  );
}

export function ContractScene() {
  return (
    <IsoFigure
      title="Hợp đồng thông minh: một giao dịch gọi hợp đồng, mọi nút chạy cùng đoạn mã và cập nhật dữ liệu; lệnh sai luật bị hủy và hoàn tác"
      viewBox="0 0 440 300"
      duration={DURATION}
      poster={4.8}
      steps={STEPS}
      render={render}
    />
  );
}
