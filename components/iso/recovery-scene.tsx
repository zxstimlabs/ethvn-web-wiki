'use client';

import { useState } from 'react';
import type { BoxSpec, Pt } from '@/lib/hero/iso';
import { backOut, easeInOut, lerp, prog } from '@/lib/hero/timeline';
import { cn } from '@/lib/cn';
import { IsoFigure, type Step } from './figure';
import { Arrow, Badge, Box, Card, Phone, Pill, Server, Shadow, Text } from './parts';

/**
 * The wallet doesn't hold the money. Lost phone: the balance stays on every
 * node; the recovery phrase in another wallet app gives back the same key,
 * the same address and the same balance. Leaked phrase: someone else's wallet
 * derives the same key and moves everything, and the network accepts it,
 * because whoever holds the key is the owner.
 */

type Kind = 'lost' | 'leak';
const ME: Pt = [96, 228];
const NEW_PHONE: Pt = [180, 240];
const THIEF: Pt = [404, 252];
const PAPER: Pt = [60, 118];
const PAPER_SPEC: BoxSpec = { w: 30, d: 22, h: 2 };
const NODES: Pt[] = [
  [250, 158],
  [314, 126],
  [378, 158],
];
const NODE_SPEC: BoxSpec = { w: 24, d: 24, h: 30 };
const LEDGER = { x: 214, y: 16, w: 210 };
const ADDRESS = '0x71C7…976F';

const STEPS: Record<Kind, Step[]> = {
  lost: [
    { at: 0, title: 'Tiền nằm trên mạng lưới', body: 'Số dư của địa chỉ được ghi trên mọi nút của Ethereum. Ví trên điện thoại chỉ đọc số dư đó, và giữ khóa để ký giao dịch.' },
    { at: 2.6, title: 'Mất điện thoại', body: 'Điện thoại mất hay hỏng, nhưng số dư không nằm trong máy. Trên mạng lưới, địa chỉ của bạn vẫn có 1,5 ETH.' },
    { at: 4.8, title: 'Nhập cụm từ vào ví mới', body: 'Cài lại ví, hoặc phần lớn ví khác dùng cùng chuẩn, rồi nhập 12 từ. Ví tính lại đúng khóa riêng tư cũ.' },
    { at: 7.6, title: 'Cùng địa chỉ, cùng số dư', body: 'Cùng khóa thì cùng địa chỉ. Ví mới đọc số dư từ mạng lưới, và bạn dùng tiếp như cũ.' },
  ],
  leak: [
    { at: 0, title: 'Cụm từ bị lộ', body: 'Một ảnh chụp màn hình, một ghi chú trên đám mây, hay một trang web giả: kẻ gian có được 12 từ của bạn.' },
    { at: 2.6, title: 'Kẻ gian có cùng khóa', body: 'Ví của kẻ gian tính ra đúng khóa và địa chỉ của bạn. Không cần mật khẩu, không cần điện thoại của bạn.' },
    { at: 4.8, title: 'Chuyển hết, không đòi lại được', body: 'Giao dịch có chữ ký hợp lệ nên mạng lưới chấp nhận. Trên Ethereum, ai giữ khóa là chủ, và giao dịch đã gửi thì không đảo ngược được.' },
  ],
};
const DURATION: Record<Kind, number> = { lost: 11, leak: 9 };

function fly(from: Pt, to: Pt, k: number, arc = 24): Pt {
  const e = easeInOut(k);
  return [lerp(from[0], to[0], e), lerp(from[1], to[1], e) - Math.sin(Math.PI * e) * arc];
}

const above = (p: Pt): Pt => [p[0] + 8, p[1] - 52];

function Network({ balance, drained, note }: { balance: string; drained: boolean; note?: string }) {
  return (
    <>
      {NODES.map((a, i) => (
        <Arrow key={i} from={a} to={NODES[(i + 1) % NODES.length]} head={false} opacity={0.5} />
      ))}
      {NODES.map((n, i) => (
        <Server key={i} at={n} spec={NODE_SPEC} />
      ))}
      <Text x={NODES[1][0]} y={NODES[0][1] + 34} className={note ? 'iso-note is-bad' : 'iso-sub'}>
        {note ?? 'mọi nút của Ethereum'}
      </Text>
      <Card x={LEDGER.x} y={LEDGER.y} w={LEDGER.w} title="SỐ DƯ TRÊN MẠNG LƯỚI" rows={[`${ADDRESS}   ${balance}`]} highlight={drained ? 0 : undefined} />
      <Arrow from={[LEDGER.x + LEDGER.w / 2, LEDGER.y + 40]} to={[NODES[1][0], NODES[1][1] - 66]} head={false} opacity={0.5} />
    </>
  );
}

function Paper({ opacity }: { opacity?: number }) {
  return (
    <g opacity={opacity}>
      <Shadow at={PAPER} spec={PAPER_SPEC} />
      <Box at={PAPER} spec={PAPER_SPEC} tone="key" />
      <Text x={PAPER[0]} y={PAPER[1] + 28} className="iso-sub">
        cụm từ khôi phục
      </Text>
      <Text x={PAPER[0]} y={PAPER[1] + 41} className="iso-sub">
        (12 từ)
      </Text>
    </g>
  );
}

function render(t: number, kind: Kind) {
  const dur = DURATION[kind];
  const fade = 1 - prog(t, dur - 0.6, 0.6);
  const pills: { at: Pt; text: string; tone: 'tx' | 'ok' | 'bad' | 'key' }[] = [];

  if (kind === 'lost') {
    const read = prog(t, 0.6, 1.2);
    const lost = prog(t, 2.6, 0.6);
    const words = prog(t, 5, 1.3);
    const derived = t >= 6.4;
    const read2 = prog(t, 7.6, 1.2);
    const ok = t >= 8.8;
    if (read > 0 && read < 1) pills.push({ at: fly(NODES[0], above(ME), read), text: '1,5 ETH', tone: 'ok' });
    if (words > 0 && words < 1) pills.push({ at: fly(PAPER, above(NEW_PHONE), words, 34), text: '12 từ', tone: 'key' });
    if (read2 > 0 && read2 < 1) pills.push({ at: fly(NODES[0], above(NEW_PHONE), read2), text: '1,5 ETH', tone: 'ok' });
    return (
      <g opacity={fade < 1 ? 0.3 + 0.7 * fade : 1}>
        <Network balance="1,5 ETH" drained={false} />
        <Paper />

        {/* your phone, then lost */}
        <Phone at={ME} opacity={1 - lost * 0.8} />
        {lost > 0 && <Box at={[ME[0] + 2, ME[1] + 2]} spec={{ w: 6, d: 24, h: 40 }} tone="bad" opacity={lost * 0.6 * (1 - prog(t, 4.6, 0.5))} />}
        <Text x={ME[0] + 8} y={ME[1] + 30} className={lost > 0.5 ? 'iso-note is-bad' : 'iso-lbl'}>
          {lost > 0.5 ? 'mất điện thoại' : 'Ví A'}
        </Text>
        <Text x={ME[0] + 8} y={ME[1] + 44} className="iso-sub" opacity={1 - lost}>
          {t >= 1.8 ? '1,5 ETH' : ''}
        </Text>
        <Badge at={[ME[0] + 8, ME[1] - 58]} ok={false} scale={backOut(prog(t, 2.8, 0.3)) * (1 - prog(t, 4.6, 0.4))} r={8} />
        <Text x={NODES[1][0]} y={NODES[0][1] + 48} className="iso-note is-ok" opacity={prog(t, 3.2, 0.4) * (1 - prog(t, 4.8, 0.4))}>
          số dư vẫn còn
        </Text>

        {/* a new phone with another wallet app */}
        <g opacity={prog(t, 4.6, 0.4)}>
          <Phone at={NEW_PHONE} lit={words > 0.9 && !derived} />
          <Text x={NEW_PHONE[0] + 8} y={NEW_PHONE[1] + 30}>
            Ví B
          </Text>
          <Text x={NEW_PHONE[0] + 8} y={NEW_PHONE[1] + 44} className={ok ? 'iso-sub is-ok' : 'iso-sub'}>
            {ok ? '1,5 ETH' : 'ứng dụng khác'}
          </Text>
        </g>
        {derived && (
          <g opacity={prog(t, 6.4, 0.4)}>
            <Box at={[NEW_PHONE[0] + 28, NEW_PHONE[1] + 6]} spec={{ w: 12, d: 12, h: 10 }} tone="key" />
            <Text x={NEW_PHONE[0] + 44} y={NEW_PHONE[1] + 12} anchor="start" className="iso-note is-key">
              cùng khóa → {ADDRESS}
            </Text>
          </g>
        )}
        <Badge at={[NEW_PHONE[0] + 8, NEW_PHONE[1] - 68]} ok scale={ok ? backOut(prog(t, 8.8, 0.3)) : 0} r={8} />

        {pills.map((p, i) => (
          <Pill key={i} at={p.at} text={p.text} tone={p.tone} />
        ))}
      </g>
    );
  }

  // the phrase leaks
  const leak = prog(t, 0.6, 1.6);
  const derived = t >= 2.6;
  const send = prog(t, 4.8, 1.3);
  const drained = t >= 6.1;
  if (leak > 0 && leak < 1) pills.push({ at: fly(PAPER, above(THIEF), leak, 70), text: '12 từ', tone: 'bad' });
  if (send > 0 && send < 1) pills.push({ at: fly(above(THIEF), [NODES[2][0], NODES[2][1] - 52], send), text: 'chuyển 1,5 ETH', tone: 'bad' });
  return (
    <g opacity={fade < 1 ? 0.3 + 0.7 * fade : 1}>
      <Network balance={drained ? '0 ETH' : '1,5 ETH'} drained={drained} note={t >= 6.4 ? 'chữ ký hợp lệ: chấp nhận' : undefined} />
      <Paper />
      <Text x={PAPER[0]} y={PAPER[1] - 22} className="iso-note is-bad" opacity={prog(t, 0.4, 0.3) * (1 - prog(t, 2.6, 0.3))}>
        ảnh chụp màn hình
      </Text>

      {/* your phone, still in your hand */}
      <Phone at={ME} />
      <Text x={ME[0] + 8} y={ME[1] + 30}>
        Ví của bạn
      </Text>
      <Text x={ME[0] + 8} y={ME[1] + 44} className={drained ? 'iso-sub is-bad' : 'iso-sub'}>
        {drained ? '0 ETH' : '1,5 ETH'}
      </Text>

      {/* someone else's wallet */}
      <g className="tone-bad">
        <Phone at={THIEF} lit={leak > 0.9 && !derived} />
      </g>
      <Text x={THIEF[0] + 8} y={THIEF[1] + 30} className="iso-note is-bad">
        kẻ gian
      </Text>
      {derived && (
        <g opacity={prog(t, 2.6, 0.4)}>
          <Box at={[THIEF[0] - 20, THIEF[1] + 6]} spec={{ w: 12, d: 12, h: 10 }} tone="key" />
          <Text x={THIEF[0] - 36} y={THIEF[1] + 12} anchor="end" className="iso-note is-key">
            cùng khóa → {ADDRESS}
          </Text>
        </g>
      )}
      <Badge at={[NODES[2][0] + 24, NODES[2][1] - 48]} ok scale={drained ? backOut(prog(t, 6.1, 0.3)) : 0} r={8} />

      {pills.map((p, i) => (
        <Pill key={i} at={p.at} text={p.text} tone={p.tone} />
      ))}
    </g>
  );
}

export function RecoveryScene() {
  const [kind, setKind] = useState<Kind>('lost');
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
      title="Ví không chứa tiền: số dư nằm trên mạng lưới; mất điện thoại thì nhập cụm từ khôi phục vào ví khác để lấy lại cùng địa chỉ và số dư; lộ cụm từ thì kẻ gian có cùng khóa và chuyển hết tiền"
      viewBox="0 0 440 300"
      duration={DURATION[kind]}
      poster={kind === 'lost' ? 9.4 : 7}
      steps={STEPS[kind]}
      render={(t) => render(t, kind)}
      controls={
        <div className="flex shrink-0 border border-fd-border">
          {tab('lost', 'Mất điện thoại')}
          {tab('leak', 'Lộ cụm từ')}
        </div>
      }
    />
  );
}
