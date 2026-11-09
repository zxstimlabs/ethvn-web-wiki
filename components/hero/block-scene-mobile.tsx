'use client';

import type { CSSProperties } from 'react';
import { cn } from '@/lib/cn';
import { STEPS, STILL_STEPS } from './content';
import { Caption, Hud, InfoPopup, type OpenInfo, SceneSvg, TourChip, useHero } from './hero-parts';
import { TALL } from './layout';

/** Full width, on the half of the scene away from the "+", so the part being explained stays in view. */
function popupStyle(o: OpenInfo): CSSProperties {
  return o.y > o.h / 2 ? { left: 8, right: 8, top: 8 } : { left: 8, right: 8, bottom: 8 };
}

/**
 * Home hero for phones: the same story as `BlockScene`, composed top to
 * bottom so every part stays on screen at a readable size, with no camera
 * moves. Only the step being told is shown under the scene.
 */
export function BlockSceneMobile({ className }: { className?: string }) {
  const hero = useHero(TALL);
  return (
    <figure
      ref={hero.rootRef}
      data-mode="story"
      data-layout="tall"
      className={cn('eth-scene mx-auto max-w-[440px] overflow-hidden border border-fd-border bg-fd-background', className)}
    >
      <Hud compact />
      <div ref={hero.wrapRef} className="relative">
        <SceneSvg L={TALL} hero={hero} />
        {hero.open && <InfoPopup hero={hero} style={popupStyle(hero.open)} />}
      </div>
      <TourChip hero={hero} variant="bar" />

      <ol className="grid border-t border-fd-border">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            data-k={`step-${i}`}
            data-active={String(STILL_STEPS[i])}
            data-tone={step.tone}
            className="eth-step group relative p-4 transition-colors [grid-area:1/1] data-[active=false]:invisible data-[active=false]:opacity-0"
          >
            <span className="eth-step-bar absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 transition-transform duration-300 group-data-[active=true]:scale-x-100" />
            <p className="text-[11px] tabular-nums tracking-[0.12em] text-fd-muted-foreground">
              {String(i + 1).padStart(2, '0')} / {String(STEPS.length).padStart(2, '0')}
            </p>
            <h3 className="mt-1 text-sm font-semibold text-fd-foreground">{step.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-fd-muted-foreground">{step.body}</p>
          </li>
        ))}
      </ol>
      <Caption />
    </figure>
  );
}
