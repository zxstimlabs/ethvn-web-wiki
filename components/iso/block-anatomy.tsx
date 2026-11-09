'use client';

import type { BoxSpec, Pt } from '@/lib/hero/iso';
import { COS30, boxEdges } from '@/lib/hero/iso';
import { easeInOut, easeOut, lerp, prog } from '@/lib/hero/timeline';
import { IsoFigure, type Step } from './figure';
import { Arrow, Box, Card, Cube, Shadow, Text } from './parts';

/**
 * What a block is: transactions from the mempool fill it up to its gas limit,
 * a header records the slot, proposer, parent hash and state root, and the
 * sealed block links to its parent.
 */

const DURATION = 12;
const PARENT: Pt = [80, 182];
const PARENT_SPEC: BoxSpec = { w: 40, d: 40, h: 36 };
const NEW: Pt = [238, 182];
const FRAME: BoxSpec = { w: 56, d: 56, h: 52 };
const BASE: BoxSpec = { w: 56, d: 56, h: 3 };
const SLAB_H = 6;
const LAYERS = 8;
const MEMPOOL: Pt = [384, 250];
const POOL: BoxSpec = { w: 56, d: 46, h: 5 };
const TX: BoxSpec = { w: 9, d: 9, h: 9, z: POOL.h };
const POOL_TX: Pt[] = [
  [370, 244],
  [388, 236],
  [404, 248],
  [378, 258],
  [396, 262],
];
const METER = { x: 304, top: 108, bottom: 196 };

const slabAt = (n: number) => 0.3 + n * 0.62;

const STEPS: Step[] = [
  { at: 0, title: 'Gom giao dịch', body: 'Giao dịch được chọn từ mempool và xếp vào khối, tới khi gần chạm giới hạn gas của khối.' },
  {
    at: 5.6,
    title: 'Ghi phần đầu khối',
    body: 'Phần đầu khối ghi số khe, người đề xuất, mã băm khối cha và gốc trạng thái: bản tóm tắt mọi tài khoản sau khi chạy các giao dịch.',
  },
  { at: 7.4, title: 'Niêm phong và nối', body: 'Mã băm của khối tính từ nội dung. Các nút chạy lại giao dịch để kiểm tra, rồi nối khối vào sau khối cha.' },
];

function render(t: number) {
  const reset = 1 - prog(t, 11.2, 0.7);
  const filled = Array.from({ length: LAYERS }, (_, n) => prog(t, slabAt(n) + 0.45, 0.2));
  const count = filled.filter((k) => k >= 1).length;
  const gas = (filled.reduce((a, k) => a + k, 0) / LAYERS) * 0.92;
  const card = prog(t, 5.6, 0.4);
  const rowsShown = Math.floor(prog(t, 5.8, 1.3) * 4.999);
  const seal = easeInOut(prog(t, 7.4, 0.6));
  const link = easeInOut(prog(t, 8.2, 0.7));

  const rows = ['Khe          15.610.344', 'Người đề xuất  #412.087', 'Khối cha       #5e08', 'Gốc trạng thái 0xd1e4…'];
  const sealedSpec: BoxSpec = { w: FRAME.w, d: FRAME.d, h: LAYERS * SLAB_H + BASE.h };

  return (
    <>
      {/* the parent, already on the chain */}
      <Shadow at={PARENT} spec={PARENT_SPEC} />
      <Cube at={PARENT} spec={PARENT_SPEC} />
      <Text x={PARENT[0]} y={PARENT[1] - 64} className="iso-hash">
        #5e08
      </Text>
      <Text x={PARENT[0]} y={PARENT[1] + 40}>
        Khối cha
      </Text>
      <Arrow from={[PARENT[0] - PARENT_SPEC.w * COS30 - 4, PARENT[1] - 18]} to={[8, PARENT[1] - 18]} tone="block" head={false} opacity={0.5} />

      {/* the mempool: transactions waiting */}
      <Shadow at={MEMPOOL} spec={POOL} />
      <Box at={MEMPOOL} spec={POOL} />
      {POOL_TX.map((p, i) => (
        <Box key={i} at={p} spec={TX} tone="tx" />
      ))}
      <Text x={MEMPOOL[0]} y={MEMPOOL[1] + 46}>
        Mempool
      </Text>
      <Text x={MEMPOOL[0]} y={MEMPOOL[1] + 60} className="iso-sub">
        giao dịch đang chờ
      </Text>

      {/* the new block: a frame that fills with transactions, then seals */}
      <g opacity={reset}>
        <Shadow at={NEW} spec={FRAME} />
        <Box at={NEW} spec={BASE} />
        {seal < 1 &&
          filled.map((k, n) =>
            k > 0 ? (
              <g key={n} opacity={(1 - seal) * k}>
                <Box at={[NEW[0], NEW[1] - (1 - easeOut(k)) * 8]} spec={{ w: FRAME.w - 6, d: FRAME.d - 6, h: SLAB_H, z: BASE.h + n * SLAB_H }} tone="tx" />
              </g>
            ) : null,
          )}
        {seal > 0 && <Cube at={NEW} spec={sealedSpec} opacity={seal} />}
        {seal < 1 && <path className="ghost" d={boxEdges(NEW[0], NEW[1], { ...FRAME, h: sealedSpec.h })} opacity={1 - seal} />}
        <Text x={NEW[0]} y={NEW[1] - 96} className="iso-hash" opacity={seal}>
          #c4d1
        </Text>
      </g>
      <Text x={NEW[0]} y={NEW[1] + 50}>
        Khối mới
      </Text>
      <Text x={NEW[0]} y={NEW[1] + 64} className="iso-sub">
        {count} giao dịch
      </Text>

      {/* a transaction hopping from the mempool into the block */}
      {Array.from({ length: LAYERS }, (_, n) => {
        const k = prog(t, slabAt(n), 0.45);
        if (k <= 0 || k >= 1) return null;
        const e = easeInOut(k);
        const from = POOL_TX[n % POOL_TX.length];
        const to: Pt = [NEW[0], NEW[1] - BASE.h - n * SLAB_H - 10];
        return <Box key={n} at={[lerp(from[0], to[0], e), lerp(from[1], to[1], e) - Math.sin(Math.PI * e) * 26]} spec={TX} tone="tx" />;
      })}

      {/* gas used, up to the block's gas limit */}
      <rect x={METER.x - 3} y={METER.top} width={6} height={METER.bottom - METER.top} className="card" />
      <rect
        x={METER.x - 3}
        y={METER.bottom - (METER.bottom - METER.top) * gas * reset}
        width={6}
        height={(METER.bottom - METER.top) * gas * reset}
        style={{ fill: 'var(--tx)' }}
      />
      <line x1={METER.x - 7} x2={METER.x + 7} y1={METER.top} y2={METER.top} className="iso-line" data-tone="bad" style={{ strokeDasharray: 'none' }} />
      <Text x={METER.x + 10} y={METER.top + 4} className="iso-sub" anchor="start">
        giới hạn gas
      </Text>
      <Text x={METER.x + 10} y={METER.bottom} className="iso-sub" anchor="start">
        gas
      </Text>

      {/* the header */}
      <Card x={262} y={10} w={170} title="PHẦN ĐẦU KHỐI" rows={rows.slice(0, rowsShown)} opacity={card * reset} />

      {/* the link back to the parent */}
      <Arrow from={[NEW[0] - FRAME.w * COS30 - 4, NEW[1] - 22]} to={[PARENT[0] + PARENT_SPEC.w * COS30 + 4, NEW[1] - 22]} tone="block" k={link * reset} />
    </>
  );
}

export function BlockAnatomy() {
  return (
    <IsoFigure
      title="Một khối: giao dịch từ mempool được xếp vào tới giới hạn gas, phần đầu khối ghi khe, người đề xuất, khối cha và gốc trạng thái, rồi khối nối vào chuỗi"
      viewBox="0 0 440 300"
      duration={DURATION}
      poster={9.6}
      steps={STEPS}
      render={render}
    />
  );
}
