'use client';

import type { BoxSpec, Pt } from '@/lib/hero/iso';
import { backOut, prog } from '@/lib/hero/timeline';
import { IsoFigure, type Step } from './figure';
import { Arrow, Box, Card, Pill, Shadow, Text } from './parts';

/**
 * Ethereum is public and pseudonymous: every transaction of an address can be
 * read by anyone. The moment one counterparty (an exchange with ID checks)
 * ties the address to a name, the whole history belongs to that person.
 * Keeping separate addresses for separate purposes limits the damage.
 */

const DURATION = 12;
const YOU: Pt = [220, 162];
const NODE: BoxSpec = { w: 22, d: 22, h: 14 };
const ME: BoxSpec = { w: 30, d: 30, h: 18 };
const PEERS: { at: Pt; hex: string; who: string }[] = [
  { at: [92, 100], hex: '0xa1…4e', who: 'sàn X' },
  { at: [220, 62], hex: '0x3c…9b', who: 'công ty (lương)' },
  { at: [348, 100], hex: '0x5f…21', who: 'chủ nhà' },
  { at: [380, 196], hex: '0x8d…07', who: 'quán cà phê' },
  { at: [60, 196], hex: '0x2b…c3', who: 'bạn bè' },
];
const EXCHANGE = 0;
const FRESH: Pt = [220, 262];
const FRESH_PEER: Pt = [330, 262];

const STEPS: Step[] = [
  { at: 0, title: 'Mọi giao dịch đều công khai', body: 'Ai cũng xem được mọi giao dịch của một địa chỉ: gửi cho ai, nhận từ đâu, bao nhiêu, lúc nào.' },
  { at: 3, title: 'Địa chỉ chỉ là bút danh', body: 'Trên chuỗi không ghi tên bạn, chỉ có địa chỉ. Ethereum là công khai dưới bút danh, không phải ẩn danh.' },
  { at: 5.4, title: 'Lộ một lần là lộ hết', body: 'Rút tiền từ sàn đã xác minh danh tính, hay khoe địa chỉ công khai, là gắn tên bạn vào địa chỉ. Từ đó toàn bộ lịch sử là của bạn.' },
  { at: 8.6, title: 'Tách địa chỉ cho từng việc', body: 'Dùng địa chỉ khác nhau cho những việc khác nhau, và đừng nạp tiền cho chúng từ cùng một nơi. Cách này giảm rủi ro, nhưng không làm bạn ẩn danh.' },
];

function render(t: number) {
  const fade = 1 - prog(t, 11.4, 0.6);
  const exposed = t >= 6.2 && t < 11.4;
  const kyc = prog(t, 5.6, 0.5);
  const fresh = backOut(prog(t, 8.8, 0.4));

  return (
    <g opacity={fade < 1 ? 0.3 + 0.7 * fade : 1}>
      {/* the history: one edge per counterparty, appearing one by one */}
      {PEERS.map((p, i) => {
        const k = prog(t, 0.3 + i * 0.45, 0.4);
        return k > 0 ? (
          <Arrow key={i} from={[YOU[0], YOU[1] - 14]} to={[p.at[0], p.at[1] - 10]} head={false} tone={exposed ? 'bad' : 'tx'} k={k} opacity={0.85} />
        ) : null;
      })}

      {PEERS.map((p, i) => {
        const shown = t >= 0.3 + i * 0.45;
        return (
          <g key={i} opacity={shown ? 1 : 0.25}>
            <Shadow at={p.at} spec={NODE} />
            <Box at={p.at} spec={NODE} tone={i === EXCHANGE && kyc > 0 ? 'key' : 'device'} />
            <Text x={p.at[0]} y={p.at[1] + 24} className={exposed ? 'iso-note is-bad' : 'iso-sub'}>
              {exposed ? p.who : p.hex}
            </Text>
          </g>
        );
      })}

      {/* you */}
      <Shadow at={YOU} spec={ME} />
      <Box at={YOU} spec={ME} tone={exposed ? 'bad' : 'tx'} />
      <Text x={YOU[0]} y={YOU[1] + 30} className={exposed ? 'iso-hash is-bad' : 'iso-hash'}>
        {exposed ? 'An Nguyễn' : '0x71C7…976F'}
      </Text>
      {t >= 3 && t < 5.4 && (
        <Pill at={[YOU[0], YOU[1] - 48]} text="tên? không ghi" tone="tx" opacity={prog(t, 3, 0.3)} />
      )}
      {t < 3 && t > 2 && (
        <Text x={YOU[0]} y={YOU[1] - 44} className="iso-note is-tx" opacity={prog(t, 2, 0.3)}>
          ai cũng xem được
        </Text>
      )}

      {/* the exchange knows who you are */}
      {kyc > 0 && t < 11.4 && (
        <Card x={10} y={16} w={152} title="SÀN X · ĐÃ XÁC MINH" rows={['An Nguyễn', 'CCCD ✓']} opacity={kyc} highlight={exposed ? 0 : undefined} />
      )}
      {exposed && (
        <Text x={YOU[0]} y={YOU[1] + 46} className="iso-note is-bad">
          cả lịch sử lộ theo
        </Text>
      )}

      {/* a separate address for another purpose */}
      {fresh > 0 && (
        <g>
          <Arrow from={[FRESH[0], FRESH[1] - 10]} to={[FRESH_PEER[0], FRESH_PEER[1] - 10]} head={false} tone="ok" opacity={0.85} />
          <Shadow at={FRESH} spec={NODE} />
          <Box at={[FRESH[0], FRESH[1] - (1 - fresh) * 8]} spec={NODE} tone="final" />
          <Box at={FRESH_PEER} spec={NODE} />
          <Text x={FRESH[0] - 20} y={FRESH[1] + 4} className="iso-hash is-ok" anchor="end">
            0x9b2E…51d0
          </Text>
          <Text x={FRESH[0] - 20} y={FRESH[1] + 18} className="iso-sub" anchor="end">
            địa chỉ khác, việc khác
          </Text>
        </g>
      )}
    </g>
  );
}

export function PrivacyScene() {
  return (
    <IsoFigure
      title="Quyền riêng tư: mọi giao dịch của một địa chỉ đều công khai; khi địa chỉ bị gắn với danh tính, toàn bộ lịch sử bị lộ; dùng địa chỉ riêng cho từng việc"
      viewBox="0 0 440 300"
      duration={DURATION}
      poster={7.4}
      steps={STEPS}
      render={render}
    />
  );
}
