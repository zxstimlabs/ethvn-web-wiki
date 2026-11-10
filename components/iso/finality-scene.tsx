'use client';

import type { BoxSpec, Pt } from '@/lib/hero/iso';
import { iso } from '@/lib/hero/iso';
import { backOut, easeInOut, easeOut, lerp, prog } from '@/lib/hero/timeline';
import { IsoFigure, type Step } from './figure';
import { Arrow, Badge, Box, Flame, Pill, Shadow, Text } from './parts';

/**
 * Finality, time-lapsed: slots fill three epochs of 32; each epoch's first
 * block is its checkpoint; when the votes for a checkpoint reach 2/3 of all
 * staked ETH it is justified, and when the next checkpoint is justified too,
 * the earlier one is finalized together with every block before it. A block
 * waits 2 to 3 epochs (about 13 to 19 minutes). Reverting a finalized block
 * means at least 1/3 of all stake breaks the rules and is slashed.
 *
 * Simplified like the home hero: a checkpoint counts as justified the moment
 * its gauge passes 2/3 (on mainnet that is processed at the epoch boundary).
 */

const DURATION = 13;
const SLOTS = 32;
const COLS = 8;
const EPOCH_S = 2.8;
const START = 0.2;
/** real minutes per second of animation */
const MIN_PER_S = 6.4 / EPOCH_S;
const PARTICIPATION = 0.99;

const Y = 172;
const XS = [80, 220, 360];
const SLAB: BoxSpec = { w: 92, d: 48, h: 4 };
const CELL: BoxSpec = { w: 9, d: 9, h: 6, z: 4 };
const CHECKPOINT: BoxSpec = { w: 9, d: 9, h: 16, z: 4 };
const MISSED = new Set(['0:21', '2:9']);
const TX = { e: 0, s: 11 };

const slotAt = (e: number, s: number) => START + e * EPOCH_S + s * (EPOCH_S / SLOTS);
const cellAt = (e: number, s: number): Pt => iso(XS[e], Y, -38.5 + (s % COLS) * 11, -16.5 + Math.floor(s / COLS) * 11);
/** the moment epoch e's checkpoint passes 2/3 of the stake */
const justifiedAt = (e: number) => START + e * EPOCH_S + ((2 / 3) / PARTICIPATION) * EPOCH_S;
/** checkpoint e is finalized when checkpoint e + 1 is justified */
const finalAt = (e: number) => justifiedAt(e + 1) + 0.2;
const TX_AT = slotAt(TX.e, TX.s);
const TX_FINAL = finalAt(1);

const STEPS: Step[] = [
  { at: 0, title: 'Khe và kỷ nguyên', body: 'Mỗi khe 12 giây có thể có một khối, khe nào người đề xuất vắng thì trống. 32 khe là một kỷ nguyên, dài 6,4 phút. Giao dịch của bạn đã vào khối, nhưng chưa đạt tính cuối cùng.' },
  { at: 3, title: 'Mốc và phiếu 2/3', body: 'Khối đầu mỗi kỷ nguyên là một mốc. Trong mỗi kỷ nguyên, mọi trình xác thực bỏ phiếu một lần. Khi phiếu đạt 2/3 tổng số ETH đặt cọc, mốc được chứng minh (justified).' },
  { at: 7.6, title: 'Hai mốc liền nhau', body: 'Mốc sau cũng được chứng minh thì mốc trước đạt tính cuối cùng, kéo theo mọi khối trước nó. Tính từ lúc vào khối, việc này mất 2 tới 3 kỷ nguyên, khoảng 13 tới 19 phút.' },
  { at: 9.6, title: 'Đảo ngược là tự đốt tiền', body: 'Muốn đảo ngược một khối đã đạt tính cuối cùng, ít nhất 1/3 tổng số ETH đặt cọc phải vi phạm luật, và số tiền cọc đó bị cắt.' },
];

function render(t: number) {
  const fade = 1 - prog(t, DURATION - 0.6, 0.6);
  const minutes = Math.max(0, Math.min(t, TX_FINAL) - TX_AT) * MIN_PER_S;
  const txFinal = t >= TX_FINAL;
  const attack = prog(t, 9.8, 1.1);
  const refused = t >= 10.9;

  const isFinal = (e: number, s: number) => {
    // checkpoint 0 finalizes when checkpoint 1 is justified; the rest of
    // epoch 0 (and checkpoint 1) when checkpoint 2 is justified, as a ripple
    // running back from checkpoint 1
    if (e === 0 && s === 0) return t >= finalAt(0);
    if (e === 1 && s === 0) return t >= finalAt(1);
    if (e === 0) return t >= finalAt(1) + (SLOTS - s) * 0.018;
    return false;
  };

  return (
    <g opacity={fade < 1 ? 0.3 + 0.7 * fade : 1}>
      {/* the clock, time-lapsed */}
      <Text x={12} y={22} anchor="start" className={txFinal ? 'iso-lbl is-ok' : 'iso-lbl'} opacity={prog(t, TX_AT, 0.3)}>
        {txFinal ? `tính cuối cùng sau ≈ ${Math.round(minutes)} phút` : `${Math.round(minutes)} phút kể từ khi vào khối`}
      </Text>
      <Text x={12} y={36} anchor="start" className="iso-sub">
        tua nhanh: 1 giây ≈ 2 phút
      </Text>

      {XS.map((x, e) => {
        const begun = t >= slotAt(e, 0);
        const votes = Math.min(1, prog(t, START + e * EPOCH_S, EPOCH_S)) * PARTICIPATION;
        const justified = t >= justifiedAt(e);
        const finalized = e < 2 && t >= finalAt(e);
        const gaugeY = Y - 104;
        const flagTop = cellAt(e, 0);
        return (
          <g key={e}>
            <Shadow at={[x, Y]} spec={SLAB} />
            <Box at={[x, Y]} spec={SLAB} />
            {Array.from({ length: SLOTS }, (_, s) => {
              const st = slotAt(e, s);
              if (t < st || MISSED.has(`${e}:${s}`)) return null;
              const lift = (1 - easeOut(prog(t, st, 0.18))) * 14;
              const at = cellAt(e, s);
              const tone = isFinal(e, s) ? 'final' : e === TX.e && s === TX.s ? 'tx' : 'block';
              return <Box key={s} at={[at[0], at[1] - lift]} spec={s === 0 ? CHECKPOINT : CELL} tone={tone} />;
            })}

            {/* the checkpoint's flag, and the gauge of votes for it */}
            {begun && (
              <>
                <path className="iso-line" d={`M${flagTop[0]} ${flagTop[1] - 20} V${flagTop[1] - 36}`} />
                <path d={`M${flagTop[0]} ${flagTop[1] - 36} l10 3.5 l-10 3.5 Z`} style={{ fill: finalized ? 'var(--vote)' : 'var(--amber)' }} />
                <Text x={flagTop[0] - 6} y={flagTop[1] - 28} anchor="end" className="iso-sub">
                  mốc
                </Text>
                <Arrow from={[x, gaugeY + 27]} to={[flagTop[0] + 4, flagTop[1] - 40]} head={false} opacity={0.6} />
                <rect className="card" x={x - 38} y={gaugeY} width={76} height={7} />
                <rect x={x - 38} y={gaugeY} width={76 * votes} height={7} style={{ fill: justified ? 'var(--vote)' : 'var(--block)' }} />
                <path className="iso-line" d={`M${x - 38 + (76 * 2) / 3} ${gaugeY - 3} v13`} />
                <Text x={x - 38 + (76 * 2) / 3} y={gaugeY - 6} className="iso-sub">
                  2/3
                </Text>
                <Text x={x} y={gaugeY + 20} className={finalized ? 'iso-note is-ok' : justified ? 'iso-lbl' : 'iso-sub'}>
                  {finalized ? 'tính cuối cùng' : justified ? 'được chứng minh' : 'đang bỏ phiếu'}
                </Text>
              </>
            )}
            <Text x={x} y={Y + 52} className="iso-sub">
              {e === 0 ? 'Kỷ nguyên N' : `Kỷ nguyên N+${e}`}
            </Text>
          </g>
        );
      })}

      {/* your transaction's block */}
      {(() => {
        const at = cellAt(TX.e, TX.s);
        const land = prog(t, TX_AT, 0.25);
        return (
          <>
            {land > 0 && t < 3.2 && (
              <Pill at={[at[0], at[1] - 26]} text="giao dịch của bạn" tone="tx" opacity={Math.min(land, 1 - prog(t, 2.9, 0.3))} />
            )}
            <Badge at={[at[0], at[1] - 18]} ok scale={txFinal ? backOut(prog(t, TX_FINAL + 0.4, 0.35)) * (1 - prog(t, 9.8, 0.2)) : 0} r={7} />
            <Badge at={[at[0], at[1] - 18]} ok={false} scale={refused ? backOut(prog(t, 10.9, 0.3)) : 0} r={8} />
          </>
        );
      })()}

      {/* trying to reverse it */}
      {attack > 0 && attack < 1 && (
        <Pill
          at={(() => {
            const to = cellAt(TX.e, TX.s);
            const e = easeInOut(attack);
            return [lerp(330, to[0] + 10, e), lerp(250, to[1] - 34, e) - Math.sin(Math.PI * e) * 30] as Pt;
          })()}
          text="đảo ngược?"
          tone="bad"
        />
      )}
      {refused && (
        <g opacity={prog(t, 10.9, 0.3)}>
          <Flame at={[150, 256]} scale={0.6 + 0.08 * Math.sin(t * 9)} />
          <Text x={164} y={250} anchor="start" className="iso-note is-bad">
            phải mất ≥ 1/3 tổng tiền cọc
          </Text>
        </g>
      )}
    </g>
  );
}

export function FinalityScene() {
  return (
    <IsoFigure
      title="Tính cuối cùng: các khối được gom thành kỷ nguyên 32 khe; khi mốc của hai kỷ nguyên liền nhau đều nhận phiếu từ 2/3 tổng số ETH đặt cọc, mốc trước và mọi khối trước nó đạt tính cuối cùng, sau khoảng 13 tới 19 phút"
      viewBox="0 0 440 266"
      duration={DURATION}
      poster={8.6}
      steps={STEPS}
      render={render}
    />
  );
}
