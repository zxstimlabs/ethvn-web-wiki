'use client';

import type { BoxSpec, Pt } from '@/lib/hero/iso';
import { boxEdges, iso } from '@/lib/hero/iso';
import { backOut, easeInOut, easeOut, lerp, prog } from '@/lib/hero/timeline';
import { IsoFigure, type Step } from './figure';
import { Badge, Box, Phone, Pill, Shadow, Text } from './parts';

/**
 * One address, separate networks: the same key gives the same address on
 * Ethereum and on compatible networks, but each network keeps its own
 * balances; the wallet shows the network it is set to. A bridge moves funds
 * between networks. Sending on the wrong network delivers to the right
 * address on a network the recipient (here an exchange) may not watch.
 */

const DURATION = 13;
const Y = 158;
const XS = [82, 220, 358];
const NAMES = ['Ethereum', 'Base', 'Arbitrum'];
const SLAB: BoxSpec = { w: 80, d: 56, h: 6 };
const TILE: BoxSpec = { w: 18, d: 18, h: 12, z: 6 };
const EXCHANGE: BoxSpec = { w: 18, d: 18, h: 18, z: 6 };
const PHONE: Pt = [40, 264];
const ADDRESS = '0x71C7…976F';

const mine = (i: number): Pt => iso(XS[i], Y, -22, -12);
const desk = (i: number): Pt => iso(XS[i], Y, 20, 12);

const STEPS: Step[] = [
  { at: 0, title: 'Cùng địa chỉ trên nhiều mạng', body: 'Cùng một khóa cho ra cùng một địa chỉ trên Ethereum và các mạng tương thích như Base hay Arbitrum. Nhưng mỗi mạng giữ sổ số dư riêng.' },
  { at: 3, title: 'Ví chỉ hiện mạng đang chọn', body: 'Ví đang ở mạng Ethereum thì chỉ thấy số dư trên Ethereum. 10 USDC trên Base vẫn còn đó, chỉ là ở mạng khác.' },
  { at: 6, title: 'Cầu nối chuyển giữa các mạng', body: 'Muốn đưa tiền sang mạng khác, dùng cầu nối (bridge): tiền bị khóa hoặc đốt ở mạng này, rồi được trả ra ở mạng kia.' },
  { at: 9, title: 'Gửi nhầm mạng', body: 'Sàn chỉ nhận USDC trên Ethereum mà bạn gửi trên Arbitrum: tiền tới đúng địa chỉ nhưng ở mạng sàn không theo dõi. Lấy lại được hay không tùy sàn, có khi mất hẳn.' },
];

function render(t: number) {
  const fade = 1 - prog(t, DURATION - 0.6, 0.6);
  const drop = easeOut(prog(t, 0.5, 0.7));
  const shown = prog(t, 1.4, 0.4);
  const selected = t < 3 ? -1 : t < 4.6 ? 0 : t < 7.6 ? 1 : 2;
  const bridge = prog(t, 6.2, 1.3);
  const bridged = t >= 7.5;
  const exchange = prog(t, 9, 0.4);
  const deposit = prog(t, 9.6, 1.3);
  const lost = t >= 10.9;

  const balances = ['0,5 ETH', bridge > 0.1 ? '0 USDC' : '10 USDC', lost ? '0 USDC' : bridged ? '10 USDC' : '0 USDC'];
  const phoneLine = selected < 0 ? '' : `${NAMES[selected]} · ${balances[selected]}`;

  // the bridge arc, Base → Arbitrum
  const a: Pt = [mine(1)[0], mine(1)[1] - 34];
  const b: Pt = [mine(2)[0], mine(2)[1] - 34];
  const c: Pt = [(a[0] + b[0]) / 2, a[1] - 70];
  const onArc = (k: number): Pt => {
    const e = easeInOut(k);
    const u = 1 - e;
    return [u * u * a[0] + 2 * u * e * c[0] + e * e * b[0], u * u * a[1] + 2 * u * e * c[1] + e * e * b[1]];
  };

  return (
    <g opacity={fade < 1 ? 0.3 + 0.7 * fade : 1}>
      <Text x={220} y={26} className="iso-lbl" opacity={shown}>
        cùng địa chỉ {ADDRESS} trên cả ba mạng
      </Text>

      {XS.map((x, i) => {
        const tile = mine(i);
        const isSel = i === selected;
        return (
          <g key={i}>
            <Shadow at={[x, Y]} spec={SLAB} />
            <Box at={[x, Y]} spec={SLAB} tone={i === 0 ? 'block' : 'l2'} />
            {isSel && <path className="iso-line" data-tone="tx" d={boxEdges(x, Y, SLAB)} style={{ strokeWidth: 2.5 }} />}
            <Box at={[tile[0], tile[1] - (1 - drop) * 30]} spec={TILE} tone="tx" opacity={prog(t, 0.5, 0.3)} />
            <Text x={tile[0]} y={tile[1] - 30} className="iso-hash" opacity={shown}>
              {balances[i]}
            </Text>
            <Text x={x} y={Y + 50} className={isSel ? 'iso-lbl' : 'iso-sub'}>
              {NAMES[i]}
            </Text>
          </g>
        );
      })}

      {/* a bridge moves the 10 USDC */}
      {bridge > 0 && bridge < 1 && (
        <>
          <path className="iso-line" data-tone="l2" d={`M${a[0]} ${a[1]} Q${c[0]} ${c[1]} ${b[0]} ${b[1]}`} strokeDasharray="4 3" />
          <Text x={c[0]} y={c[1] + 26} className="iso-sub">
            cầu nối
          </Text>
          <Pill at={onArc(bridge)} text="10 USDC" tone="ok" />
        </>
      )}

      {/* an exchange that only takes deposits on Ethereum */}
      {exchange > 0 && (
        <g opacity={exchange}>
          <Box at={desk(0)} spec={EXCHANGE} tone="device" />
          <Text x={desk(0)[0] + 16} y={desk(0)[1] + 2} anchor="start" className="iso-sub">
            sàn
          </Text>
          <path className="iso-line" d={boxEdges(desk(2)[0], desk(2)[1], EXCHANGE)} strokeDasharray="3 3" />
          <Text x={desk(2)[0] - 14} y={desk(2)[1] + 4} anchor="end" className="iso-sub">
            địa chỉ sàn
          </Text>
        </g>
      )}
      {deposit > 0 && deposit < 1 && (
        <Pill
          at={(() => {
            const e = easeInOut(deposit);
            const to = desk(2);
            return [lerp(PHONE[0] + 40, to[0], e), lerp(PHONE[1] - 50, to[1] - 34, e) - Math.sin(Math.PI * e) * 40] as Pt;
          })()}
          text="nạp 10 USDC cho sàn"
          tone="tx"
        />
      )}
      {lost && (
        <g opacity={prog(t, 10.9, 0.3)}>
          <Box at={desk(2)} spec={{ ...EXCHANGE, h: 4 }} tone="bad" />
          <Text x={desk(2)[0] + 14} y={desk(2)[1] - 4} anchor="start" className="iso-hash is-bad">
            10 USDC
          </Text>
          <Badge at={[desk(0)[0] + 22, desk(0)[1] - 26]} ok={false} scale={backOut(prog(t, 11.2, 0.3))} r={8} />
          <Text x={desk(0)[0] + 16} y={desk(0)[1] + 16} anchor="start" className="iso-note is-bad">
            không thấy
          </Text>
        </g>
      )}

      {/* your wallet, set to one network at a time */}
      <Phone at={PHONE} />
      <Text x={PHONE[0] + 24} y={PHONE[1] - 6} anchor="start" className="iso-sub">
        ví đang ở mạng
      </Text>
      <Text x={PHONE[0] + 24} y={PHONE[1] + 10} anchor="start" opacity={selected < 0 ? 0 : 1}>
        {phoneLine}
      </Text>
    </g>
  );
}

export function NetworksScene() {
  return (
    <IsoFigure
      title="Một địa chỉ, nhiều mạng: cùng khóa cho cùng địa chỉ trên Ethereum, Base và Arbitrum, nhưng mỗi mạng giữ số dư riêng; cầu nối chuyển tiền giữa các mạng; gửi nhầm mạng thì tiền tới đúng địa chỉ nhưng ở mạng người nhận không theo dõi"
      viewBox="0 0 440 300"
      duration={DURATION}
      poster={5.4}
      steps={STEPS}
      render={render}
    />
  );
}
