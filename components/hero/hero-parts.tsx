'use client';

import { type CSSProperties, useCallback, useEffect, useRef, useState } from 'react';
import NextLink from 'next/link';
import { ArrowLeft, ArrowRight, X } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { SLOTS_PER_EPOCH, T, slotClock } from '@/lib/hero/timeline';
import { CAPTION, INFO_BY_ID, MORE, SEEN_KEY, TOUR } from './content';
import { collect, render, renderStory } from './engine';
import type { Layout } from './layout';
import { StaticScene } from './scene';
import './block-scene.css';

/** The "+" whose popup is open: button centre and scene wrapper size, in px relative to the wrapper. */
export interface OpenInfo {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * Everything the two versions share: the animation loop on the mainnet slot
 * clock, the "+" popups with their guided tour, and the per-viewer record of
 * which "+" have been opened.
 */
export function useHero(L: Layout) {
  const rootRef = useRef<HTMLElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const popRef = useRef<HTMLDivElement>(null);
  /** while a popup is open the scene holds still, so it can be read and tapped */
  const frozenRef = useRef(false);
  const lastRef = useRef<string | null>(null);
  const [open, setOpen] = useState<OpenInfo | null>(null);
  const [seen, setSeen] = useState<Set<string>>(() => new Set());
  const openRef = useRef(open);
  openRef.current = open;

  // explored parts are a per-viewer convenience: remembered in this browser only
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(SEEN_KEY) ?? '[]');
      if (Array.isArray(stored)) setSeen(new Set(stored.filter((id) => id in INFO_BY_ID)));
    } catch {
      // storage blocked: start fresh
    }
  }, []);

  const openInfo = useCallback((id: string) => {
    const el = rootRef.current?.querySelector(`[data-info="${id}"]`);
    const wrap = wrapRef.current?.getBoundingClientRect();
    if (!el || !wrap) return;
    const b = el.getBoundingClientRect();
    lastRef.current = id;
    setOpen({ id, x: b.left + b.width / 2 - wrap.left, y: b.top + b.height / 2 - wrap.top, w: wrap.width, h: wrap.height });
    setSeen((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev).add(id);
      try {
        localStorage.setItem(SEEN_KEY, JSON.stringify([...next]));
      } catch {
        // storage blocked: keep it in memory
      }
      return next;
    });
  }, []);

  const close = useCallback(() => {
    const hadFocus = popRef.current?.contains(document.activeElement);
    setOpen(null);
    if (hadFocus && lastRef.current) {
      rootRef.current?.querySelector<SVGGElement>(`[data-info="${lastRef.current}"]`)?.focus({ preventScroll: true });
    }
  }, []);

  const go = useCallback(
    (delta: number) => {
      const i = TOUR.indexOf(openRef.current?.id ?? '');
      openInfo(TOUR[(i + delta + TOUR.length) % TOUR.length]);
    },
    [openInfo],
  );

  const startTour = useCallback(() => {
    openInfo(TOUR.find((id) => !seen.has(id)) ?? TOUR[0]);
  }, [openInfo, seen]);

  const onSceneActivate = useCallback(
    (target: EventTarget) => {
      const el = (target as Element).closest?.('[data-info]');
      if (!el) return false;
      const id = el.getAttribute('data-info')!;
      if (openRef.current?.id === id) close();
      else openInfo(id);
      return true;
    },
    [close, openInfo],
  );

  // reflect popup + progress on the SVG buttons, and hold the scene while a popup is open
  useEffect(() => {
    frozenRef.current = open !== null;
    const root = rootRef.current;
    if (!root) return;
    root.setAttribute('data-paused', String(open !== null));
    root.querySelectorAll('[data-info]').forEach((el) => {
      el.setAttribute('data-active', String(el.getAttribute('data-info') === open?.id));
    });
    if (open && !popRef.current?.contains(document.activeElement)) popRef.current?.focus({ preventScroll: true });
  }, [open]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.setAttribute('data-explored', String(seen.size > 0));
    root.querySelectorAll('[data-info]').forEach((el) => {
      el.setAttribute('data-seen', String(seen.has(el.getAttribute('data-info')!)));
    });
  }, [seen]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'ArrowLeft') go(-1);
    };
    const onDown = (e: PointerEvent) => {
      const t = e.target as Element;
      if (!popRef.current?.contains(t) && !t.closest?.('[data-info]')) close();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onDown);
    };
  }, [open, close, go]);

  // the animation loop
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const dom = collect(root, L);
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;
    let timer = 0;
    let visible = true;

    const still = () => {
      if (!frozenRef.current) renderStory(dom, { ...slotClock(Date.now()), t: T.still });
    };
    const tick = () => {
      raf = 0;
      const clock = slotClock(Date.now());
      // Dev only: set `window.__ethHeroT = 2.8` to freeze the story at that second,
      // or `window.__ethHeroFF = 5` to freeze the fast-forward.
      if (process.env.NODE_ENV !== 'production') {
        const w = window as { __ethHeroT?: number; __ethHeroFF?: number };
        if (typeof w.__ethHeroT === 'number' || typeof w.__ethHeroFF === 'number') {
          const ff = typeof w.__ethHeroFF === 'number';
          clock.slot = clock.slot - (clock.slot % 2) + (ff ? 1 : 0);
          clock.slotInEpoch = clock.slot % SLOTS_PER_EPOCH;
          clock.t = (ff ? w.__ethHeroFF : w.__ethHeroT) as number;
        }
      }
      if (!frozenRef.current) render(dom, clock);
      if (visible) raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      window.clearInterval(timer);
      timer = 0;
    };
    const start = () => {
      stop();
      if (reduce.matches) {
        // no motion: a still frame whose slot numbers stay current
        still();
        timer = window.setInterval(still, 1000);
      } else if (visible) raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(root);
    reduce.addEventListener('change', start);
    start();

    return () => {
      stop();
      io.disconnect();
      reduce.removeEventListener('change', start);
    };
  }, [L]);

  return { rootRef, wrapRef, popRef, open, seen, close, go, startTour, onSceneActivate };
}

export type Hero = ReturnType<typeof useHero>;

// ── shared chrome ────────────────────────────────────────────────────────

/** Slot clock and progress bar above the scene. `compact` drops the words that don't fit on a phone. */
export function Hud({ compact = false }: { compact?: boolean }) {
  return (
    <>
      <div className="flex items-center justify-between gap-3 border-b border-fd-border px-3 py-2 text-[11px] uppercase tracking-[0.12em] text-fd-muted-foreground">
        <span className="truncate">Một khối ra đời</span>
        <span className="flex shrink-0 items-center gap-3 tabular-nums">
          <span className="hud-live flex items-center gap-1.5">
            <span className="eth-live-dot size-1.5 rounded-full" aria-hidden />
            {!compact && <span>Giờ mainnet</span>}
          </span>
          <span className="hud-ff">⏩ Tua nhanh</span>
          <span className="hud-paused">⏸ Tạm dừng</span>
          <span>
            Khe <b data-k="hud-slot" className="hud-num font-semibold text-fd-foreground">—</b>
          </span>
          {!compact && (
            <span>
              Kỷ nguyên <b data-k="hud-epoch" className="hud-num font-semibold text-fd-foreground">—</b>
            </span>
          )}
          <span>
            <span data-k="hud-pos">—</span>/32
          </span>
        </span>
      </div>
      <div className="relative h-px bg-fd-border">
        <div data-k="hud-bar" className="eth-bar absolute inset-0 origin-left" style={{ transform: 'scaleX(0)' }} />
      </div>
    </>
  );
}

/** The scene itself. Clicks and keys on a "+" open its popup. */
export function SceneSvg({ L, hero, className }: { L: Layout; hero: Hero; className?: string }) {
  return (
    <svg
      viewBox={L.frame.join(' ')}
      preserveAspectRatio="xMidYMid meet"
      className={cn('block w-full', className)}
      style={{ aspectRatio: `${L.frame[2]} / ${L.frame[3]}` }}
      aria-labelledby={`eth-hero-title-${L.name} eth-hero-desc-${L.name}`}
      onClick={(e) => hero.onSceneActivate(e.target)}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && hero.onSceneActivate(e.target)) e.preventDefault();
      }}
    >
      <StaticScene L={L} />
    </svg>
  );
}

/**
 * Invites the viewer to explore, and starts the guided tour at the first "+" not yet opened.
 * `float` sits over the scene's corner and hides while a popup is open; `bar` is a full-width row under the scene.
 */
export function TourChip({ hero, variant = 'float', className }: { hero: Hero; variant?: 'float' | 'bar'; className?: string }) {
  if (variant === 'float' && hero.open) return null;
  return (
    <button
      type="button"
      onClick={hero.startTour}
      className={cn(
        'inline-flex items-center gap-1.5 text-[11px] text-fd-muted-foreground transition-colors hover:text-fd-foreground',
        variant === 'float'
          ? 'absolute z-[5] border border-fd-border bg-fd-background/90 px-2 py-1 backdrop-blur'
          : 'w-full justify-center border-t border-fd-border px-3 py-2.5',
        className,
      )}
    >
      <span aria-hidden className="inline-flex size-3.5 items-center justify-center border border-current leading-none">
        +
      </span>
      {hero.seen.size === 0 ? 'Bấm + để tìm hiểu từng phần' : 'Tìm hiểu tiếp'}
      <span className="tabular-nums">
        · {hero.seen.size}/{TOUR.length}
      </span>
    </button>
  );
}

export function Caption() {
  return (
    <figcaption className="border-t border-fd-border px-4 py-2.5 text-xs leading-relaxed text-fd-muted-foreground">
      {CAPTION}
    </figcaption>
  );
}

export function InfoPopup({ hero, style }: { hero: Hero; style: CSSProperties }) {
  const { open, seen, close, go } = hero;
  if (!open) return null;
  const info = INFO_BY_ID[open.id];
  const more = MORE[open.id];
  const index = TOUR.indexOf(open.id);
  const nav = buttonVariants({ variant: 'ghost', size: 'sm' });
  return (
    <div
      ref={hero.popRef}
      role="dialog"
      aria-labelledby="eth-info-title"
      aria-describedby="eth-info-body"
      tabIndex={-1}
      className="absolute z-10 border border-fd-border bg-fd-popover p-4 text-fd-popover-foreground shadow-xl outline-none"
      style={style}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] tracking-[0.14em] text-fd-muted-foreground">
            <span className="uppercase">{info.kind === 'rel' ? 'Liên hệ' : 'Chi tiết'}</span> · {info.via}
          </p>
          <h4 id="eth-info-title" className="mt-1 text-sm font-semibold">
            {info.title}
          </h4>
        </div>
        <button type="button" onClick={close} aria-label="Đóng" className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }), '-mt-1 -mr-1')}>
          <X />
        </button>
      </div>
      <p id="eth-info-body" className="mt-2 text-sm leading-relaxed">
        {info.body}
      </p>
      {more && (
        <NextLink
          href={more.href}
          className="mt-3 inline-flex items-center gap-1 text-sm font-medium underline decoration-fd-border underline-offset-4 hover:decoration-fd-foreground"
        >
          Đọc thêm: {more.label}
          <ArrowRight className="size-3.5" />
        </NextLink>
      )}
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-fd-border pt-3">
        <button type="button" onClick={() => go(-1)} className={nav}>
          <ArrowLeft data-icon="inline-start" />
          Trước
        </button>
        <span className="text-[11px] tabular-nums text-fd-muted-foreground">
          {index + 1}/{TOUR.length} · đã xem {seen.size}
        </span>
        <button type="button" onClick={() => go(1)} className={nav}>
          Tiếp
          <ArrowRight data-icon="inline-end" />
        </button>
      </div>
    </div>
  );
}
