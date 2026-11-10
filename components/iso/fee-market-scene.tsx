'use client';

import type { BoxSpec, Pt } from '@/lib/hero/iso';
import { boxEdges, leftFace, rightFace, toPath } from '@/lib/hero/iso';
import { easeInOut, easeOut, lerp, prog } from '@/lib/hero/timeline';
import { IsoFigure, type Step } from './figure';
import { Box, Pill, Shadow, Text } from './parts';

/**
 * Why fees go up and down (EIP-1559): each block has a gas limit and a target
 * of half of it. A block above the target raises the next block's base fee,
 * up to 12.5% for a full block; a block below it lowers the fee. A rush of
 * transactions fills blocks and the fee climbs block by block; when the rush
 * passes, blocks run below the target and the fee falls again.
 */

const DURATION = 13.6;
const Y = 176;
const HEAD = 326;
const SPACING = 68;
const SHOWN = 5;
const CONTAINER: BoxSpec = { w: 30, d: 30, h: 46 };
const MEMPOOL: Pt = [394, 238];
const TILE: BoxSpec = { w: 11, d: 11, h: 4 };

/** gas used / gas limit of each block, in order; 0.5 is the target */
const FULL = [0.5, 0.5, 1, 1, 1, 1, 0.75, 0.5, 0.2, 0.1, 0.25, 0.5];
const BORN = FULL.map((_, i) => 0.4 + i * 1.05);
/** base fee of each block, from its parent's fullness */
const FEE = FULL.reduce<number[]>((fees, _, i) => {
  fees.push(i === 0 ? 1 : fees[i - 1] * (1 + 0.125 * (2 * FULL[i - 1] - 1)));
  return fees;
}, []);

const gwei = new Intl.NumberFormat('vi-VN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const pct = new Intl.NumberFormat('vi-VN', { maximumFractionDigits: 1, signDisplay: 'exceptZero' });

const STEPS: Step[] = [
  { at: 0, title: 'Mục tiêu là nửa khối', body: 'Mỗi khối có giới hạn gas, và mức mục tiêu bằng một nửa. Khối dùng đúng mục tiêu thì phí cơ sở của khối sau giữ nguyên.' },
  { at: 2.5, title: 'Đông người: khối đầy, phí tăng', body: 'Khi nhiều người cùng gửi, khối đầy tới giới hạn. Mỗi khối đầy làm phí cơ sở của khối sau tăng 12,5%. Bốn khối đầy liền nhau làm phí tăng khoảng 60%.' },
  { at: 6.6, title: 'Phí cao, người không vội chờ', body: 'Phí cao khiến những ai không vội gửi sau. Khối bớt đầy, phí tăng chậm lại rồi dừng.' },
  { at: 8.8, title: 'Vắng người: phí giảm', body: 'Khối dùng ít hơn mục tiêu thì phí cơ sở giảm, mỗi khối tối đa 12,5%. Phí có thể đổi sau mỗi khối, tức mỗi 12 giây.' },
];

/** how many transactions are waiting, over the loop */
function waiting(t: number) {
  if (t < 2) return 3;
  if (t < 5.4) return lerp(3, 12, easeInOut(prog(t, 2, 3.4)));
  if (t < 9) return lerp(12, 3, easeInOut(prog(t, 5.4, 3.6)));
  if (t < 12) return lerp(3, 1, prog(t, 9, 3));
  return lerp(1, 3, prog(t, 12, 1.2));
}

function render(t: number) {
  const fade = 1 - prog(t, DURATION - 0.6, 0.6);
  const born = BORN.map((b) => easeInOut(prog(t, b, 0.5)));
  const count = born.reduce((a, b) => a + b, 0);
  const newest = born.findLastIndex((b) => b > 0);
  const fee = newest >= 0 ? FEE[newest] : FEE[0];
  const change = newest > 0 ? 12.5 * (2 * FULL[newest - 1] - 1) : 0;
  const n = Math.round(waiting(t));

  return (
    <g opacity={fade < 1 ? 0.3 + 0.7 * fade : 1}>
      {/* the current base fee */}
      <Text x={14} y={24} anchor="start" className="iso-sub">
        phí cơ sở của khối mới nhất (minh họa)
      </Text>
      <text x={14} y={50} className="iso-lbl" style={{ fontSize: 22 }}>
        {gwei.format(fee)} gwei
      </text>
      {newest > 0 && change !== 0 && (
        <Pill at={[188, 43]} text={`${pct.format(change)}%`} tone={change > 0 ? 'bad' : 'ok'} opacity={prog(t, BORN[newest], 0.3)} />
      )}

      {/* the legend for the dashed line */}
      <path className="iso-line" d="M14 274 h22" strokeDasharray="4 3" style={{ stroke: 'var(--amber)' }} />
      <Text x={42} y={278} anchor="start" className="iso-sub">
        mục tiêu: nửa giới hạn gas
      </Text>

      {/* the blocks, newest on the right */}
      {FULL.map((full, i) => {
        if (born[i] <= 0) return null;
        const idx = Math.max(0, count - 1 - i);
        if (idx > SHOWN) return null;
        const x = HEAD - idx * SPACING;
        const isNew = i === newest && born[i] < 1;
        const lift = isNew ? (1 - easeOut(prog(t, BORN[i], 0.5))) * 36 : 0;
        const opacity = Math.min(prog(t, BORN[i], 0.25), 1 - Math.max(0, idx - (SHOWN - 1)));
        const at: Pt = [x, Y - lift];
        const used = CONTAINER.h * full * (isNew ? easeOut(prog(t, BORN[i] + 0.1, 0.5)) : 1);
        const L = leftFace(at[0], at[1], CONTAINER);
        const R = rightFace(at[0], at[1], CONTAINER);
        const half = CONTAINER.h / 2;
        const over = full > 0.5;
        return (
          <g key={i} opacity={opacity}>
            <Shadow at={[x, Y]} spec={CONTAINER} />
            {used > 0.5 && <Box at={at} spec={{ ...CONTAINER, h: used }} tone={over ? 'tx' : 'block'} />}
            <path className="iso-line" d={boxEdges(at[0], at[1], CONTAINER)} strokeDasharray="2 2" />
            <path
              className="iso-line"
              d={toPath([L(0, half), L(CONTAINER.w, half), R(CONTAINER.d, half)])}
              strokeDasharray="4 3"
              style={{ stroke: 'var(--amber)', strokeWidth: 1.5 }}
            />
            <Text x={x} y={Y - lift - 70} className="iso-hash">
              {gwei.format(FEE[i])}
            </Text>
            <Text x={x} y={Y + 38} className={over ? 'iso-sub is-tx' : 'iso-sub'}>
              {full === 1 ? 'đầy' : `dùng ${Math.round(full * 100)}%`}
            </Text>
          </g>
        );
      })}

      {/* transactions waiting to get in */}
      <Shadow at={MEMPOOL} spec={TILE} />
      {Array.from({ length: n }, (_, k) => (
        <Box key={k} at={MEMPOOL} spec={{ ...TILE, z: k * 5 }} tone="tx" />
      ))}
      <Text x={MEMPOOL[0]} y={MEMPOOL[1] + 24} className="iso-sub">
        đang chờ
      </Text>
      <Text x={MEMPOOL[0]} y={MEMPOOL[1] + 37} className="iso-sub">
        {n} giao dịch
      </Text>
    </g>
  );
}

export function FeeMarketScene() {
  return (
    <IsoFigure
      title="Phí cơ sở lên xuống: khối nào dùng quá nửa giới hạn gas thì phí cơ sở của khối sau tăng, tối đa 12,5%; khối dùng ít hơn thì phí giảm"
      viewBox="0 0 440 290"
      duration={DURATION}
      poster={6.2}
      steps={STEPS}
      render={render}
    />
  );
}
