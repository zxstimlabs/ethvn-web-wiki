'use client';

import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import { STEPS, STILL_STEPS } from './content';
import { Caption, Hud, InfoPopup, type OpenInfo, SceneSvg, TourChip, useHero } from './hero-parts';
import { WIDE } from './layout';

/** Anchored next to its "+", on the side with room. */
function popupStyle(o: OpenInfo): CSSProperties {
  const width = 340;
  const left = o.x + 22 + width <= o.w - 8 ? o.x + 22 : Math.max(8, o.x - 22 - width);
  return o.y < o.h / 2 ? { left, width, top: Math.max(8, o.y - 24) } : { left, width, bottom: Math.max(8, o.h - o.y - 24) };
}

/**
 * Home hero, landscape (tablets and up): one Ethereum slot told in 12 real
 * seconds, then a fast-forward to the block's finality. Phones get
 * `BlockSceneMobile`, the same story composed top to bottom.
 */
export function BlockScene({ className }: { className?: string }) {
  const hero = useHero(WIDE);
  return (
    <figure
      ref={hero.rootRef}
      data-mode="story"
      data-layout="wide"
      className={cn('eth-scene overflow-hidden border border-fd-border bg-fd-background', className)}
    >
      <Hud />
      <div ref={hero.wrapRef} className="relative">
        <SceneSvg L={WIDE} hero={hero} />
        {hero.open && <InfoPopup hero={hero} style={popupStyle(hero.open)} />}
        <TourChip hero={hero} className="right-2 bottom-2" />
      </div>

      <ol className="grid grid-cols-3 border-t border-fd-border">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            data-k={`step-${i}`}
            data-active={String(STILL_STEPS[i])}
            data-tone={step.tone}
            className={cn('eth-step group relative border-fd-border p-4 transition-colors', i % 3 !== 0 && 'border-l', i >= 3 && 'border-t')}
          >
            <span className="eth-step-bar absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-data-[active=true]:scale-x-100" />
            <p className="text-[11px] tabular-nums tracking-[0.12em] text-fd-muted-foreground">{String(i + 1).padStart(2, '0')}</p>
            <h3 className="mt-1 text-sm font-semibold text-fd-muted-foreground transition-colors group-data-[active=true]:text-fd-foreground">
              {step.title}
            </h3>
            <p className="mt-1 text-sm leading-relaxed text-fd-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
      <Caption />
    </figure>
  );
}
