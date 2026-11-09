'use client';

import { useState } from 'react';
import type { BoxSpec, Pt } from '@/lib/hero/iso';
import { COS30 } from '@/lib/hero/iso';
import { backOut, easeInOut, hash01, lerp, prog } from '@/lib/hero/timeline';
import { cn } from '@/lib/cn';
import { IsoFigure, type Step } from './figure';
import { Arrow, Badge, Coins, Cube, Server, Shadow, Text } from './parts';

/**
 * Who gets to add the next block. Proof of work: miners race to solve a
 * puzzle by brute force, burning electricity. Proof of stake: validators lock
 * up ETH, one is picked at random to propose, the others vote.
 */

type Kind = 'pow' | 'pos';
const DURATION = 8;
const CHAIN_Y = 78;
const CHAIN_XS = [128, 212, 296];
const BLOCK: BoxSpec = { w: 32, d: 32, h: 28 };
const HALF = BLOCK.w * COS30;
const ROW: Pt[] = [
  [80, 214],
  [168, 214],
  [256, 214],
  [344, 214],
];
const STAKES = [2, 4, 3, 5];
const WINNER: Record<Kind, number> = { pow: 2, pos: 1 };
const METER = { x: 416, top: 140, bottom: 226 };

const STEPS: Record<Kind, Step[]> = {
  pow: [
    { at: 0, title: 'Thi giải đố', body: 'Thợ đào cho máy thử hàng tỷ con số mỗi giây, tìm lời giải cho một câu đố chỉ có thể giải bằng cách đoán.' },
    { at: 2.8, title: 'Ai giải trước thì tạo khối', body: 'Ai tìm ra trước được thêm khối và nhận thưởng. Muốn gian lận phải có hơn nửa sức mạnh tính toán của cả mạng.' },
    { at: 5, title: 'Tốn rất nhiều điện', body: 'Thứ bảo vệ mạng lưới là sức mạnh tính toán, và sức mạnh đó tốn điện thật. Bitcoin vẫn dùng cách này.' },
  ],
  pos: [
    { at: 0, title: 'Đặt cọc ETH', body: 'Trình xác thực khóa ETH làm tiền cọc. Tiền cọc càng nhiều, phiếu càng nặng và càng hay được chọn.' },
    { at: 2.8, title: 'Chọn ngẫu nhiên, số còn lại bỏ phiếu', body: 'Mỗi khe 12 giây, một trình xác thực được chọn ngẫu nhiên để đề xuất khối. Các trình xác thực khác kiểm tra và bỏ phiếu.' },
    { at: 5, title: 'Gian lận là mất cọc', body: 'An toàn đến từ tiền cọc, không phải điện năng. Ethereum dùng cách này từ năm 2022 và tốn ít điện hơn rất nhiều.' },
  ],
};

function render(t: number, kind: Kind) {
  const win = WINNER[kind];
  const found = t >= 2.8;
  const fly = easeInOut(prog(t, 3, 1.1));
  const landed = t >= 4.1;
  const reset = 1 - prog(t, 7.4, 0.6);
  const target: Pt = [CHAIN_XS[2] + 84, CHAIN_Y];
  // PoS: a random pick sweeps across the validators, then settles
  const pick = kind === 'pos' && t >= 0.6 && t < 2.8 ? Math.floor(t * 7) % ROW.length : win;
  const energy = kind === 'pow' ? 0.94 : 0.02;

  return (
    <>
      {/* the chain */}
      <Text x={16} y={CHAIN_Y - 6} anchor="start">
        Chuỗi khối
      </Text>
      {CHAIN_XS.map((x, i) => (
        <g key={x}>
          <Shadow at={[x, CHAIN_Y]} spec={BLOCK} />
          <Cube at={[x, CHAIN_Y]} spec={BLOCK} />
          {i > 0 && <Arrow from={[x - HALF - 3, CHAIN_Y - 14]} to={[CHAIN_XS[i - 1] + HALF + 3, CHAIN_Y - 14]} tone="block" />}
        </g>
      ))}
      <Arrow from={[target[0] - HALF - 3, CHAIN_Y - 14]} to={[CHAIN_XS[2] + HALF + 3, CHAIN_Y - 14]} tone="block" k={landed ? reset : 0} />

      {/* the participants */}
      {ROW.map((p, i) => {
        const chosen = i === pick && (kind === 'pos' ? t >= 0.6 : found);
        return (
          <g key={i}>
            {kind === 'pos' && <Coins at={[p[0] + 24, p[1] + 4]} n={STAKES[i]} />}
            <Server at={p} />
            {chosen && <ellipse cx={p[0]} cy={p[1]} rx={30} ry={15} className="ring" data-tone="amber" style={{ strokeWidth: 2 }} />}
            {kind === 'pow' && (
              <>
                <Text x={p[0]} y={p[1] - 54} className={found && i === win ? 'iso-hash is-ok' : 'iso-sub'}>
                  {found && i === win ? '0000…7b1e' : `${Math.floor(hash01(i, Math.floor(t * 12)) * 0xffff).toString(16).padStart(4, '0')}…`}
                </Text>
                {!found && (
                  <text x={p[0] + 18} y={p[1] - 32} className="iso-note" style={{ fill: 'var(--amber)' }} opacity={0.5 + 0.5 * Math.sin(t * 14 + i)}>
                    ⚡
                  </text>
                )}
              </>
            )}
            {kind === 'pos' && t >= 4.6 && t < 7.4 && i !== win && <Badge at={[p[0], p[1] - 50]} ok scale={backOut(prog(t, 4.6 + i * 0.12, 0.3))} r={7} />}
          </g>
        );
      })}
      <Text x={(ROW[0][0] + ROW[3][0]) / 2} y={ROW[0][1] + 38} className="iso-sub">
        {kind === 'pow' ? 'thợ đào: thi nhau đoán' : 'trình xác thực: đặt cọc ETH'}
      </Text>

      {/* the new block: from the winner up to the chain */}
      {found && (
        <g opacity={reset}>
          <Cube
            at={landed ? target : [lerp(ROW[win][0], target[0], fly), lerp(ROW[win][1] - 40, target[1], fly) - Math.sin(Math.PI * fly) * 30]}
            spec={BLOCK}
            opacity={Math.min(1, prog(t, 2.8, 0.3))}
          />
        </g>
      )}

      {/* energy */}
      <rect x={METER.x - 4} y={METER.top} width={8} height={METER.bottom - METER.top} className="card" />
      <rect
        x={METER.x - 4}
        y={METER.bottom - (METER.bottom - METER.top) * energy}
        width={8}
        height={Math.max(1.5, (METER.bottom - METER.top) * energy)}
        style={{ fill: kind === 'pow' ? 'var(--amber)' : 'var(--vote)' }}
      />
      <Text x={METER.x} y={METER.top - 8} className="iso-sub" anchor="end">
        điện năng
      </Text>
    </>
  );
}

export function ConsensusScene() {
  const [kind, setKind] = useState<Kind>('pos');
  const tab = (k: Kind, label: string) => (
    <button
      type="button"
      aria-pressed={kind === k}
      onClick={() => setKind(k)}
      className={cn('px-2 py-1 text-[11px] transition-colors', kind === k ? 'bg-fd-foreground text-fd-background' : 'text-fd-muted-foreground hover:text-fd-foreground')}
    >
      {label}
    </button>
  );
  return (
    <IsoFigure
      title="Ai được thêm khối mới: bằng chứng công việc cho các thợ đào thi nhau giải đố và tốn nhiều điện; bằng chứng cổ phần chọn ngẫu nhiên một trình xác thực đã đặt cọc, các trình xác thực khác bỏ phiếu"
      viewBox="0 0 440 280"
      duration={DURATION}
      poster={5.4}
      steps={STEPS[kind]}
      render={(t) => render(t, kind)}
      controls={
        <div className="flex shrink-0 border border-fd-border">
          {tab('pow', 'Công việc')}
          {tab('pos', 'Cổ phần')}
        </div>
      }
    />
  );
}
