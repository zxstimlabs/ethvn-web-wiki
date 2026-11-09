'use client';

import type { BoxSpec, Pt } from '@/lib/hero/iso';
import { iso } from '@/lib/hero/iso';
import { backOut, clamp01, easeInOut, lerp, prog } from '@/lib/hero/timeline';
import { IsoFigure, type Step } from './figure';
import { Badge, Box, Card, Coins, Flame, Pill, Server, Shadow, Text } from './parts';

/**
 * Why gas: every computation step costs gas, unused gas is not charged, the
 * base fee is burned and the tip goes to the validator; a program that would
 * run forever runs out of gas, is stopped and reverted, and still pays.
 */

const DURATION = 14;
const EVM: Pt = [222, 214];
const EVM_SPEC: BoxSpec = { w: 76, d: 48, h: 24 };
const OPS = 5;
const OP: BoxSpec = { w: 10, d: 10, h: 8, z: EVM_SPEC.h };
const opAt = (k: number): Pt => iso(EVM[0], EVM[1], -28 + k * 14, 0);
const TANK = { x: 172, top: 36, bottom: 126 };
const FLAME: Pt = [350, 116];
const VALIDATOR: Pt = [392, 232];
const LIMIT = 60000;
const USED = 46000;

const STEPS: Step[] = [
  { at: 0, title: 'Mỗi bước tính đều tốn gas', body: 'Mỗi phép tính trên Ethereum có một giá gas cố định. Chuyển ETH thường tốn 21.000 gas; gọi hợp đồng thì tốn hơn.' },
  { at: 3.4, title: 'Thừa thì không tính', body: 'Bạn đặt giới hạn gas cho giao dịch. Chạy xong, phần gas chưa dùng không bị tính phí.' },
  { at: 4.6, title: 'Phí cơ sở bị đốt', body: 'Phần phí cơ sở bị đốt, biến mất khỏi lưu thông. Tiền boa (phí ưu tiên) trả cho trình xác thực.' },
  { at: 7, title: 'Vòng lặp vô tận phải dừng', body: 'Chương trình chạy mãi sẽ hết gas và bị dừng, mọi thay đổi bị hoàn tác nhưng phí vẫn mất. Nhờ vậy không ai làm treo được mạng lưới.' },
];

const fmt = new Intl.NumberFormat('vi-VN');

function render(t: number) {
  const loop = t >= 7;
  const fade = 1 - prog(t, 13.4, 0.6);

  // gas left, as a share of the limit
  let left: number;
  let lit = -1;
  if (!loop) {
    const run = prog(t, 0.8, 2.4);
    left = 1 - (USED / LIMIT) * run;
    if (run > 0 && run < 1) lit = Math.min(OPS - 1, Math.floor(run * OPS));
  } else {
    const run = prog(t, 7.4, 3);
    left = 1 - run;
    if (run > 0 && run < 1) lit = Math.floor((t - 7.4) / 0.32) % OPS;
  }
  const done = !loop && t >= 3.4;
  const outOfGas = loop && t >= 10.4;
  const pay = loop ? prog(t, 11.2, 1.1) : prog(t, 4.6, 1.4);

  const fly = (to: Pt, k: number): Pt => {
    const e = easeInOut(k);
    return [lerp(EVM[0], to[0], e), lerp(EVM[1] - 40, to[1], e) - Math.sin(Math.PI * e) * 26];
  };

  return (
    <g opacity={fade < 1 ? 0.3 + 0.7 * fade : 1}>
      {/* the transaction and its gas */}
      <Card
        x={12}
        y={30}
        w={146}
        title="GIAO DỊCH"
        rows={[loop ? 'vòng lặp vô tận' : 'gọi hợp đồng', `giới hạn ${fmt.format(LIMIT)} gas`]}
        highlight={loop ? 0 : undefined}
      />
      <rect x={TANK.x - 5} y={TANK.top} width={10} height={TANK.bottom - TANK.top} className="card" />
      <rect
        x={TANK.x - 5}
        y={TANK.bottom - (TANK.bottom - TANK.top) * left}
        width={10}
        height={(TANK.bottom - TANK.top) * left}
        style={{ fill: done ? 'var(--vote)' : outOfGas ? 'var(--bad)' : 'var(--tx)' }}
      />
      <Text x={TANK.x} y={TANK.bottom + 16} className="iso-sub">
        gas còn lại
      </Text>
      {done && (
        <Pill at={[TANK.x + 4, TANK.top - 14]} text={`thừa ${fmt.format(LIMIT - USED)}: không tính`} tone="ok" opacity={Math.min(1, prog(t, 3.4, 0.3)) * (1 - prog(t, 6.6, 0.3))} />
      )}
      {outOfGas && <Pill at={[TANK.x + 4, TANK.top - 14]} text="hết gas: dừng" tone="bad" opacity={1 - prog(t, 13.2, 0.3)} />}

      {/* the EVM, running the steps */}
      <Shadow at={EVM} spec={EVM_SPEC} />
      <Box at={EVM} spec={EVM_SPEC} tone={outOfGas ? 'bad' : 'block'} />
      {Array.from({ length: OPS }, (_, k) => (
        <Box key={k} at={opAt(k)} spec={OP} tone={k === lit ? (loop ? 'bad' : 'tx') : 'device'} />
      ))}
      {loop && t < 10.4 && t >= 7.4 && (
        <path
          className="iso-line"
          data-tone="bad"
          d={`M${opAt(OPS - 1)[0] + 6} ${opAt(OPS - 1)[1] - 40} Q${EVM[0]} ${EVM[1] - 92} ${opAt(0)[0] - 6} ${opAt(0)[1] - 40}`}
        />
      )}
      <Text x={EVM[0]} y={EVM[1] + 48}>
        EVM
      </Text>
      <Text x={EVM[0]} y={EVM[1] + 62} className="iso-sub">
        mọi nút chạy từng bước
      </Text>
      <Badge at={[EVM[0] + 54, EVM[1] - 52]} ok scale={done ? backOut(prog(t, 3.2, 0.3)) * (1 - prog(t, 6.6, 0.3)) : 0} r={9} />
      <Badge at={[EVM[0] + 54, EVM[1] - 52]} ok={false} scale={outOfGas ? backOut(prog(t, 10.4, 0.3)) : 0} r={9} />
      {outOfGas && (
        <Text x={EVM[0] + 68} y={EVM[1] - 48} className="iso-note is-bad" anchor="start">
          hoàn tác
        </Text>
      )}

      {/* the fee: base fee burned, tip to the validator */}
      <Flame at={FLAME} scale={1 + 0.15 * Math.sin(t * 9) * (pay > 0 && pay < 1 ? 1 : 0.3)} />
      <Text x={FLAME[0]} y={FLAME[1] + 18} className="iso-sub">
        phí cơ sở: đốt
      </Text>
      <Server at={VALIDATOR} spec={{ w: 20, d: 20, h: 26 }} />
      <Coins at={[VALIDATOR[0] - 26, VALIDATOR[1] + 6]} n={t >= 12.3 ? 3 : t >= 6 ? 2 : 0} />
      <Text x={VALIDATOR[0] - 4} y={VALIDATOR[1] + 34} className="iso-sub">
        tiền boa:
      </Text>
      <Text x={VALIDATOR[0] - 4} y={VALIDATOR[1] + 47} className="iso-sub">
        trình xác thực
      </Text>
      {pay > 0 && pay < 1 && (
        <>
          <Box at={fly([FLAME[0], FLAME[1] - 10], clamp01(pay * 1.2))} spec={{ w: 10, d: 10, h: 3 }} tone="key" />
          <Box at={fly([VALIDATOR[0] - 26, VALIDATOR[1] - 4], clamp01(pay * 1.2 - 0.2))} spec={{ w: 10, d: 10, h: 3 }} tone="key" />
        </>
      )}
      {loop && t >= 11.2 && (
        <Text x={EVM[0]} y={EVM[1] - 108} className="iso-note is-bad" opacity={1 - prog(t, 13.2, 0.3)}>
          phí vẫn mất
        </Text>
      )}
    </g>
  );
}

export function GasScene() {
  return (
    <IsoFigure
      title="Gas: mỗi bước tính toán tốn gas, gas thừa không bị tính, phí cơ sở bị đốt và tiền boa trả cho trình xác thực; chương trình chạy mãi sẽ hết gas, bị dừng và hoàn tác nhưng vẫn mất phí"
      viewBox="0 0 440 300"
      duration={DURATION}
      poster={5.6}
      steps={STEPS}
      render={render}
    />
  );
}
