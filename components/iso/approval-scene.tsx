'use client';

import { useState } from 'react';
import type { BoxSpec, Pt } from '@/lib/hero/iso';
import { backOut, easeInOut, lerp, prog } from '@/lib/hero/timeline';
import { cn } from '@/lib/cn';
import { IsoFigure, type Step } from './figure';
import { Arrow, Badge, Box, Card, Phone, Pill, Shadow, Text } from './parts';

/**
 * Token allowances. The token contract keeps a second table next to the
 * balances: how much each app may take from you. An unlimited allowance
 * outlives your use of the app; if the app is hacked later, the attacker
 * takes everything left without asking you. An allowance of exactly what you
 * need is used up by the swap, so the hacked app gets nothing.
 */

type Kind = 'unlimited' | 'exact';
const PHONE: Pt = [64, 246];
const TOKEN: Pt = [214, 198];
const TOKEN_SPEC: BoxSpec = { w: 54, d: 54, h: 34 };
const APP: Pt = [370, 236];
const APP_SPEC: BoxSpec = { w: 38, d: 38, h: 26 };
const LEDGER = { x: 104, y: 14, w: 232 };

const STEPS: Record<Kind, Step[]> = {
  unlimited: [
    { at: 0, title: 'Cho phép chi tiêu', body: 'Để đổi token, bạn ký lệnh cho phép (approve) ứng dụng chi token của mình. Nhiều trang mặc định xin hạn mức không giới hạn.' },
    { at: 2.8, title: 'Ứng dụng dùng quyền', body: 'Bạn đổi 100 USDC. Ứng dụng tự lấy 100 USDC từ hợp đồng token. Hạn mức còn lại vẫn là không giới hạn.' },
    { at: 5.6, title: 'Ứng dụng bị hack', body: 'Nhiều tháng sau, ứng dụng bị hack hoặc vốn là lừa đảo. Kẻ gian dùng hạn mức cũ để lấy hết số token còn lại, không cần bạn ký gì thêm.' },
  ],
  exact: [
    { at: 0, title: 'Chỉ cho đúng số cần', body: 'Bạn chỉ cho phép 100 USDC, đúng số định đổi. Nhiều ví cho bạn sửa hạn mức trước khi ký.' },
    { at: 2.8, title: 'Dùng xong là hết', body: 'Ứng dụng lấy 100 USDC, và hạn mức trở về 0.' },
    { at: 5.6, title: 'Kẻ gian không lấy được', body: 'Ứng dụng bị hack cũng không lấy thêm được, vì hạn mức đã hết. Hạn mức cũ còn sót thì thu hồi được, bằng một giao dịch đặt nó về 0.' },
  ],
};
const DURATION = 10.5;

function fly(from: Pt, to: Pt, k: number, arc = 24): Pt {
  const e = easeInOut(k);
  return [lerp(from[0], to[0], e), lerp(from[1], to[1], e) - Math.sin(Math.PI * e) * arc];
}

const fmt = new Intl.NumberFormat('vi-VN');

function render(t: number, kind: Kind) {
  const fade = 1 - prog(t, DURATION - 0.6, 0.6);
  const unlimited = kind === 'unlimited';
  const approve = prog(t, 0.4, 1.2);
  const approved = t >= 1.6;
  const swap = prog(t, 2.8, 1);
  const take = prog(t, 3.9, 1);
  const swapped = t >= 4.9;
  const hacked = prog(t, 5.6, 0.4);
  const steal = prog(t, 6.6, 1.1);
  const stolen = unlimited && t >= 7.7;
  const refused = !unlimited && t >= 7.7;

  const balance = stolen ? 0 : swapped ? 900 : 1000;
  const allowance = !approved ? '0' : unlimited ? 'không giới hạn' : swapped ? '0' : '100';
  const tokenTop: Pt = [TOKEN[0], TOKEN[1] - 62];
  const appTop: Pt = [APP[0], APP[1] - 48];

  const pills: { at: Pt; text: string; tone: 'tx' | 'ok' | 'bad' | 'key' }[] = [];
  if (approve > 0 && approve < 1) pills.push({ at: fly([PHONE[0] + 8, PHONE[1] - 54], tokenTop, approve), text: unlimited ? 'approve: không giới hạn' : 'approve: 100', tone: 'key' });
  if (swap > 0 && swap < 1) pills.push({ at: fly([PHONE[0] + 8, PHONE[1] - 54], appTop, swap, 40), text: 'đổi 100 USDC', tone: 'tx' });
  if (take > 0 && take < 1) pills.push({ at: fly(appTop, tokenTop, take), text: 'lấy 100', tone: 'tx' });
  if (steal > 0 && steal < 1) pills.push({ at: fly(appTop, tokenTop, steal), text: 'lấy 900', tone: 'bad' });

  return (
    <g opacity={fade < 1 ? 0.3 + 0.7 * fade : 1}>
      {/* what the token contract keeps */}
      <Card
        x={LEDGER.x}
        y={LEDGER.y}
        w={LEDGER.w}
        title="SỔ CỦA HỢP ĐỒNG USDC"
        rows={[`số dư của bạn   ${fmt.format(balance)}`, `hạn mức cho X   ${allowance}`]}
        highlight={stolen ? [0, 1] : unlimited && approved ? 1 : undefined}
        active={!unlimited && approved && !swapped ? 1 : undefined}
      />
      <Arrow from={[LEDGER.x + LEDGER.w / 2, LEDGER.y + 54]} to={[TOKEN[0], TOKEN[1] - 66]} head={false} opacity={0.5} />

      <Shadow at={TOKEN} spec={TOKEN_SPEC} />
      <Box at={TOKEN} spec={TOKEN_SPEC} tone="block" />
      <Text x={TOKEN[0]} y={TOKEN[1] + 44}>
        Hợp đồng USDC
      </Text>
      <Badge at={[tokenTop[0] + 34, tokenTop[1] + 6]} ok scale={stolen ? backOut(prog(t, 7.7, 0.3)) : 0} r={8} />
      <Badge at={[tokenTop[0] + 34, tokenTop[1] + 6]} ok={false} scale={refused ? backOut(prog(t, 7.7, 0.3)) : 0} r={8} />
      <Text x={TOKEN[0]} y={TOKEN[1] + 58} className={stolen ? 'iso-note is-bad' : 'iso-note is-ok'} opacity={prog(t, 8, 0.4)}>
        {stolen ? 'còn hạn mức: chấp nhận' : 'hạn mức 0: từ chối'}
      </Text>

      {/* you */}
      <Phone at={PHONE} lit={approve > 0 && approve < 0.3} />
      <Text x={PHONE[0] + 8} y={PHONE[1] + 30}>
        Bạn
      </Text>
      <Text x={PHONE[0] + 8} y={PHONE[1] - 64} className="iso-note is-bad" anchor="middle" opacity={stolen ? prog(t, 8.2, 0.4) : 0}>
        không cần bạn ký
      </Text>

      {/* the app, later hacked */}
      <Shadow at={APP} spec={APP_SPEC} />
      <Box at={APP} spec={APP_SPEC} tone={hacked > 0.5 ? 'bad' : 'device'} />
      <Text x={APP[0]} y={APP[1] + 36} className={hacked > 0.5 ? 'iso-note is-bad' : 'iso-lbl'}>
        {hacked > 0.5 ? 'X bị hack' : 'Ứng dụng X'}
      </Text>
      <Text x={APP[0]} y={APP[1] + 50} className="iso-sub" opacity={hacked}>
        nhiều tháng sau
      </Text>

      {pills.map((p, i) => (
        <Pill key={i} at={p.at} text={p.text} tone={p.tone} />
      ))}
    </g>
  );
}

export function ApprovalScene() {
  const [kind, setKind] = useState<Kind>('unlimited');
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
      title="Quyền chi tiêu token: hạn mức không giới hạn còn nguyên sau khi bạn dùng xong ứng dụng, nên khi ứng dụng bị hack, kẻ gian lấy hết token còn lại; hạn mức vừa đủ thì dùng xong là hết"
      viewBox="0 0 440 300"
      duration={DURATION}
      poster={8.4}
      steps={STEPS[kind]}
      render={(t) => render(t, kind)}
      controls={
        <div className="flex shrink-0 border border-fd-border">
          {tab('unlimited', 'Không giới hạn')}
          {tab('exact', 'Vừa đủ')}
        </div>
      }
    />
  );
}
