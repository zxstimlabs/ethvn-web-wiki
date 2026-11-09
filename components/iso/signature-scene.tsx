'use client';

import type { BoxSpec, Pt } from '@/lib/hero/iso';
import { backOut, easeInOut, lerp, prog } from '@/lib/hero/timeline';
import { IsoFigure, type Step } from './figure';
import { Arrow, Badge, Box, Card, Phone, Server, Shadow, Text } from './parts';

/**
 * A signed transaction: the wallet signs with its private key; any node can
 * recover the signer from the signature and the content; change the content
 * and the signature no longer matches the sender.
 */

const DURATION = 12;
const PHONE: Pt = [70, 236];
const KEY: Pt = [104, 246];
const KEY_SPEC: BoxSpec = { w: 14, d: 14, h: 12 };
const NODE: Pt = [370, 236];
const CARD_W = 150;
const CARD_FROM: Pt = [14, 40];
const CARD_TO: Pt = [262, 40];

const STEPS: Step[] = [
  { at: 0, title: 'Ký trên ví', body: 'Ví dùng khóa riêng tư để ký nội dung giao dịch. Khóa không bao giờ rời khỏi ví.' },
  { at: 2.2, title: 'Gửi lên mạng', body: 'Thứ được gửi đi là nội dung kèm chữ ký. Ai thấy chữ ký cũng không lấy được khóa.' },
  { at: 3.8, title: 'Nút kiểm tra', body: 'Từ chữ ký và nội dung, nút tính ra địa chỉ người ký. Khớp với người gửi thì giao dịch hợp lệ.' },
  { at: 6, title: 'Sửa là lộ', body: 'Đổi số tiền làm chữ ký không còn khớp: nút tính ra một địa chỉ khác, và từ chối giao dịch.' },
];

function render(t: number) {
  const show = prog(t, 0, 0.5) * (1 - prog(t, 11.2, 0.7));
  const stamp = prog(t, 0.8, 0.9);
  const signed = t >= 1.6;
  const travel = easeInOut(prog(t, 2.2, 1.3));
  const card: Pt = [lerp(CARD_FROM[0], CARD_TO[0], travel), lerp(CARD_FROM[1], CARD_TO[1], travel) - Math.sin(Math.PI * travel) * 14];
  const check1 = prog(t, 3.9, 0.6);
  const ok = backOut(prog(t, 4.6, 0.35)) * (1 - prog(t, 5.8, 0.3));
  const tampered = t >= 6.2;
  const check2 = prog(t, 6.9, 0.6);
  const bad = backOut(prog(t, 7.6, 0.35)) * (1 - prog(t, 11.2, 0.6));
  const recovered = t >= 7.4 ? '0x9e2D…01aF' : '0x71C7…976F';

  const rows = [
    'Từ       0x71C7…976F',
    'Tới      0xAb58…3c12',
    `Số tiền  ${tampered ? '10 ETH' : '0,1 ETH'}`,
    'Nonce    7',
    signed ? 'Chữ ký   0x3f9a…c41b' : 'Chữ ký   …',
  ];

  // the key token rises from the wallet to the card while signing
  const keyRun = easeInOut(stamp);
  const keyPos: Pt = [lerp(KEY[0], CARD_FROM[0] + CARD_W - 18, keyRun), lerp(KEY[1] - 14, CARD_FROM[1] + 88, keyRun)];

  return (
    <>
      <Phone at={PHONE} lit={t >= 0.8 && t < 1.8} />
      <Shadow at={KEY} spec={KEY_SPEC} />
      <Box at={KEY} spec={KEY_SPEC} tone="key" />
      <Text x={PHONE[0] + 14} y={PHONE[1] + 34}>
        Ví
      </Text>
      <Text x={PHONE[0] + 14} y={PHONE[1] + 48} className="iso-sub is-key">
        giữ khóa riêng tư
      </Text>

      <Server at={NODE} />
      <Text x={NODE[0]} y={NODE[1] + 34}>
        Nút
      </Text>
      <Text x={NODE[0]} y={NODE[1] + 48} className="iso-sub">
        bất kỳ ai
      </Text>

      {/* signing: the key travels to the card and leaves a signature */}
      {stamp > 0 && stamp < 1 && <circle cx={keyPos[0]} cy={keyPos[1]} r={5} style={{ fill: 'var(--key)' }} />}

      <Card x={card[0]} y={card[1]} w={CARD_W} title="GIAO DỊCH" rows={rows} opacity={show} highlight={tampered ? 2 : undefined} />
      {tampered && (
        <Text x={card[0] + CARD_W / 2} y={card[1] - 8} className="iso-note is-bad" opacity={prog(t, 6.2, 0.3) * (1 - prog(t, 11.2, 0.6))}>
          ai đó sửa số tiền
        </Text>
      )}

      {/* checking: from the signature, the node recovers who signed */}
      {[check1 * (1 - prog(t, 5.8, 0.3)), check2 * (1 - prog(t, 11.2, 0.6))].map((k, i) =>
        k > 0 ? <Arrow key={i} from={[CARD_TO[0] + CARD_W / 2, CARD_TO[1] + 112]} to={[NODE[0], NODE[1] - 58]} tone={i === 0 ? 'ok' : 'bad'} k={easeInOut(k)} /> : null,
      )}
      {(ok > 0 || bad > 0) && (
        <>
          <Text x={NODE[0] - 30} y={NODE[1] - 74} className="iso-sub" anchor="end">
            người ký:
          </Text>
          <Text x={NODE[0] - 30} y={NODE[1] - 60} className={bad > 0 ? 'iso-hash is-bad' : 'iso-hash is-ok'} anchor="end">
            {recovered}
          </Text>
        </>
      )}
      <Badge at={[NODE[0] + 24, NODE[1] - 64]} ok scale={ok} />
      <Badge at={[NODE[0] + 24, NODE[1] - 64]} ok={false} scale={bad} />
      <Text x={NODE[0] - 30} y={NODE[1] - 44} className="iso-note is-bad" anchor="end" opacity={Math.min(1, bad)}>
        ≠ người gửi · từ chối
      </Text>
      <Text x={NODE[0] - 30} y={NODE[1] - 44} className="iso-note is-ok" anchor="end" opacity={Math.min(1, ok)}>
        = người gửi · hợp lệ
      </Text>
    </>
  );
}

export function SignatureScene() {
  return (
    <IsoFigure
      title="Chữ ký số: ví ký giao dịch bằng khóa riêng tư, nút kiểm tra người ký; sửa nội dung thì chữ ký không còn khớp"
      viewBox="0 0 440 300"
      duration={DURATION}
      poster={5.2}
      steps={STEPS}
      render={render}
    />
  );
}
