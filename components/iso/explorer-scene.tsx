'use client';

import type { BoxSpec, Pt } from '@/lib/hero/iso';
import { backOut, easeInOut, lerp, prog } from '@/lib/hero/timeline';
import { IsoFigure, type Step } from './figure';
import { Arrow, Badge, Box, Card, Cube, Flame, Phone, Pill, Server, Text } from './parts';

/**
 * Reading a transaction on a block explorer: paste the hash, then read status
 * and block, who sent what to whom, and what it cost. Each group of rows
 * points at the thing it describes. A generic explorer, not any brand's.
 */

const DURATION = 12;
const CHAIN_Y = 150;
const CHAIN_XS = [40, 94, 148];
const BLOCK: BoxSpec = { w: 24, d: 24, h: 22 };
const PICKED = 1;
const CARD = { x: 196, y: 14, w: 236 };
const HASH = '0x8f3a…e27c';
const ROWS = [
  `Trạng thái  ✓ thành công`,
  `Khối        23.418.902`,
  `Từ          0x71C7…976F`,
  `Tới         0xAb58…3c12`,
  `Giá trị     0,1 ETH`,
  `Phí         0,000252 ETH`,
  `Gas         21.000 / 50.000`,
  `Nonce       7`,
];
/** baseline of card row i (row 0 is the search line) */
const rowY = (i: number) => CARD.y + 18 + 11 + i * 15;
const AN: Pt = [44, 266];
const BINH: Pt = [150, 266];
const FLAME: Pt = [262, 272];
const VALIDATOR: Pt = [336, 272];

const STEPS: Step[] = [
  { at: 0, title: 'Dán mã băm giao dịch', body: 'Mỗi giao dịch có một mã băm riêng. Dán nó vào ô tìm kiếm của trình khám phá khối để xem chi tiết.' },
  { at: 2.6, title: 'Trạng thái và khối', body: 'Giao dịch thành công hay thất bại, nằm trong khối nào, và khối đó đã đạt tính cuối cùng chưa.' },
  { at: 5.4, title: 'Ai gửi gì cho ai', body: 'Địa chỉ gửi, địa chỉ nhận và số ETH. Nếu là chuyển token, trang còn có mục chuyển token riêng.' },
  { at: 8.2, title: 'Phí, gas và nonce', body: 'Gas đã dùng trên giới hạn, phí đã trả (phần phí cơ sở bị đốt, phần còn lại cho trình xác thực), và số thứ tự giao dịch.' },
];

function render(t: number) {
  const fade = 1 - prog(t, 11.4, 0.6);
  const typed = Math.round(prog(t, 0.3, 1.4) * HASH.length);
  const pull = prog(t, 1.7, 0.8);
  const shown = Math.floor(prog(t, 2.3, 0.5) * ROWS.length + (t >= 2.8 ? ROWS.length : 0));
  const group = t >= 8.2 ? [5, 6, 7] : t >= 5.4 ? [2, 3, 4] : t >= 2.6 ? [0, 1] : [];
  const send = prog(t, 5.8, 1.2);

  const rows = [`Tìm: ${HASH.slice(0, typed)}${typed < HASH.length && t > 0.3 ? '▍' : ''}`, ...ROWS.slice(0, Math.min(ROWS.length, shown))];
  const activeRows = group.map((g) => g + 1);

  // the transaction slab leaving its block for the explorer card
  const slabFrom: Pt = [CHAIN_XS[PICKED], CHAIN_Y - 30];
  const slabTo: Pt = [CARD.x + 10, rowY(0) - 4];

  return (
    <g opacity={fade < 1 ? 0.3 + 0.7 * fade : 1}>
      {/* the chain, with the block that holds our transaction */}
      <Text x={14} y={CHAIN_Y - 62} className="iso-sub" anchor="start">
        chuỗi khối
      </Text>
      {CHAIN_XS.map((x, i) => (
        <g key={x}>
          <Cube at={[x, CHAIN_Y]} spec={BLOCK} tone={i === PICKED && t >= 2.6 && t < 5.4 ? 'final' : 'block'} />
          {i > 0 && <Arrow from={[x - 24, CHAIN_Y - 11]} to={[CHAIN_XS[i - 1] + 24, CHAIN_Y - 11]} tone="block" />}
        </g>
      ))}
      {pull > 0 && pull < 1 && (
        <Box
          at={[lerp(slabFrom[0], slabTo[0], easeInOut(pull)), lerp(slabFrom[1], slabTo[1], easeInOut(pull)) - Math.sin(Math.PI * pull) * 20]}
          spec={{ w: 18, d: 18, h: 4 }}
          tone="tx"
        />
      )}

      {/* the explorer page */}
      <Card x={CARD.x} y={CARD.y} w={CARD.w} title="TRÌNH KHÁM PHÁ KHỐI" rows={rows} active={activeRows} />

      {/* status and block → the block on the chain */}
      {t >= 2.6 && t < 5.4 && (
        <>
          <Arrow from={[CARD.x - 4, rowY(2) - 4]} to={[CHAIN_XS[PICKED] + 22, CHAIN_Y - 30]} tone="ok" />
          <Badge at={[CHAIN_XS[PICKED], CHAIN_Y - 58]} ok scale={backOut(prog(t, 3.4, 0.3))} r={8} />
          <Text x={CHAIN_XS[PICKED]} y={CHAIN_Y + 34} className="iso-note is-ok" opacity={prog(t, 3.6, 0.3)}>
            đạt tính cuối cùng
          </Text>
        </>
      )}

      {/* from, to, value → the two wallets */}
      <Phone at={AN} lit={send > 0 && send < 0.3} />
      <Phone at={BINH} lit={send > 0.7 && send < 1} />
      <Text x={AN[0] + 10} y={AN[1] + 30} className="iso-sub">
        An
      </Text>
      <Text x={BINH[0] + 10} y={BINH[1] + 30} className="iso-sub">
        Bình
      </Text>
      {t >= 5.4 && t < 8.2 && (
        <>
          <Arrow from={[CARD.x - 4, rowY(4) - 4]} to={[BINH[0] + 26, BINH[1] - 44]} tone="tx" />
          <Arrow from={[AN[0] + 22, AN[1] - 24]} to={[BINH[0] - 4, BINH[1] - 24]} tone="tx" k={easeInOut(send)} />
          {send > 0.2 && <Pill at={[(AN[0] + BINH[0]) / 2 + 10, AN[1] - 46]} text="0,1 ETH" tone="tx" />}
        </>
      )}

      {/* fee → burned and tip */}
      <Flame at={FLAME} scale={0.8} />
      <Text x={FLAME[0]} y={FLAME[1] + 18} className="iso-sub">
        đốt
      </Text>
      <Server at={VALIDATOR} spec={{ w: 18, d: 18, h: 22 }} />
      <Text x={VALIDATOR[0]} y={VALIDATOR[1] + 22} className="iso-sub">
        trình xác thực
      </Text>
      {t >= 8.2 && (
        <>
          <Arrow from={[CARD.x + 60, rowY(7) + 8]} to={[FLAME[0] + 4, FLAME[1] - 36]} tone="key" opacity={1 - prog(t, 11, 0.4)} />
          <Arrow from={[CARD.x + 90, rowY(7) + 8]} to={[VALIDATOR[0] - 4, VALIDATOR[1] - 36]} tone="key" opacity={1 - prog(t, 11, 0.4)} />
          <Pill at={[FLAME[0] + 4, FLAME[1] - 56]} text="0,00021" tone="bad" opacity={prog(t, 8.6, 0.3)} />
          <Pill at={[VALIDATOR[0] + 18, VALIDATOR[1] - 56]} text="0,000042" tone="ok" opacity={prog(t, 8.6, 0.3)} />
        </>
      )}
    </g>
  );
}

export function ExplorerScene() {
  return (
    <IsoFigure
      title="Đọc một giao dịch trên trình khám phá khối: mã băm, trạng thái và khối, người gửi, người nhận và số tiền, phí và gas"
      viewBox="0 0 440 300"
      duration={DURATION}
      poster={6.6}
      steps={STEPS}
      render={render}
    />
  );
}
