'use client';

import { useEffect, useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { BlockScene } from './block-scene';
import { BlockSceneMobile } from './block-scene-mobile';
import { HeroSkeleton } from './hero-skeleton';

/**
 * Picks the hero for the screen: `BlockSceneMobile` below 768 px (shadcn's
 * `useIsMobile`), `BlockScene` above. Only one is ever mounted.
 *
 * The hook can't know the width during the server render, so the static HTML
 * holds a skeleton shaped by CSS breakpoints instead; the real scene replaces
 * it at the same size once the hook has answered.
 */
export function Hero() {
  const isMobile = useIsMobile();
  // set in the same commit as the hook's first answer: its effect runs first
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  if (!ready) return <HeroSkeleton />;
  return isMobile ? <BlockSceneMobile /> : <BlockScene />;
}
