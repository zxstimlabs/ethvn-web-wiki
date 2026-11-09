'use client';

import { type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { Pause, Play } from 'lucide-react';
import { cn } from '@/lib/cn';
import '@/components/hero/block-scene.css';
import './iso.css';

export interface Step {
  /** second of the loop where this step starts */
  at: number;
  title: string;
  body: string;
}

/**
 * Frame for an isometric explainer in a wiki page: the scene, a play/pause
 * button with a progress line, and the steps of the loop as captions (click
 * one to jump there).
 *
 * The scene is a pure function of `t` (seconds into the loop). The server
 * renders it at `poster`, so the page shows a meaningful still frame before
 * JavaScript and for readers who prefer reduced motion (who can still press
 * play). Playback stops while the figure is off screen.
 */
export function IsoFigure({
  title,
  viewBox,
  duration,
  poster,
  steps,
  render,
  controls,
  className,
}: {
  /** what the animation shows, for screen readers */
  title: string;
  viewBox: string;
  duration: number;
  poster: number;
  steps: Step[];
  render: (t: number) => ReactNode;
  /** extra controls next to the play button, e.g. a mode switch */
  controls?: ReactNode;
  className?: string;
}) {
  const rootRef = useRef<HTMLElement>(null);
  const tRef = useRef(poster);
  const [t, setT] = useState(poster);
  const [playing, setPlaying] = useState(false);

  // autoplay, unless the reader prefers reduced motion
  useEffect(() => {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) setPlaying(true);
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!playing || !root) return;
    let raf = 0;
    let visible = true;
    let last = performance.now();
    const tick = (now: number) => {
      raf = 0;
      if (!visible) return;
      const dt = Math.min(0.1, (now - last) / 1000);
      last = now;
      tRef.current = (tRef.current + dt) % duration;
      setT(tRef.current);
      raf = requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !raf) {
        last = performance.now();
        raf = requestAnimationFrame(tick);
      }
    });
    io.observe(root);
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
    };
  }, [playing, duration]);

  const seek = useCallback((at: number) => {
    tRef.current = at;
    setT(at);
  }, []);

  // Dev only: `window.__isoT = 6.5` pauses every explainer on the page at that second.
  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    const id = window.setInterval(() => {
      const at = (window as { __isoT?: number }).__isoT;
      if (typeof at === 'number' && at !== tRef.current) {
        setPlaying(false);
        seek(at);
      }
    }, 150);
    return () => window.clearInterval(id);
  }, [seek]);

  const active = steps.findLastIndex((s) => t >= s.at);

  return (
    <figure
      ref={rootRef}
      className={cn(
        'eth-scene iso-scene @container not-prose my-6 overflow-hidden border border-fd-border bg-fd-background max-sm:-mx-4 max-sm:border-x-0',
        className,
      )}
    >
      <svg viewBox={viewBox} role="img" aria-label={title} className="mx-auto block w-full max-w-[560px]">
        {render(t)}
      </svg>

      <div className="flex items-center gap-3 border-t border-fd-border px-2 py-1.5">
        <button
          type="button"
          onClick={() => setPlaying((p) => !p)}
          aria-label={playing ? 'Tạm dừng' : 'Phát'}
          className="inline-flex size-7 shrink-0 items-center justify-center text-fd-muted-foreground transition-colors hover:text-fd-foreground [&_svg]:size-3.5"
        >
          {playing ? <Pause /> : <Play />}
        </button>
        <div className="relative h-px flex-1 bg-fd-border">
          <div className="iso-step-bar absolute inset-y-0 left-0" style={{ width: `${(t / duration) * 100}%` }} />
        </div>
        {controls}
      </div>

      {/* steps side by side once the figure is wide enough, stacked otherwise */}
      <ol className={cn('grid border-t border-fd-border', steps.length <= 3 ? '@lg:grid-cols-3' : '@xl:grid-cols-4')}>
        {steps.map((s, i) => (
          <li
            key={s.title}
            className={cn(
              'border-fd-border not-first:border-t',
              steps.length <= 3 ? '@lg:not-first:border-t-0 @lg:not-first:border-l' : '@xl:not-first:border-t-0 @xl:not-first:border-l',
            )}
          >
            <button
              type="button"
              onClick={() => seek(s.at)}
              data-active={String(i === active)}
              className="iso-step group flex h-full w-full flex-col items-start justify-start p-3 text-start transition-colors"
            >
              <span className="text-[11px] tabular-nums tracking-[0.12em] text-fd-muted-foreground">{String(i + 1).padStart(2, '0')}</span>
              <span className="mt-0.5 block text-sm font-semibold text-fd-muted-foreground transition-colors group-data-[active=true]:text-fd-foreground">
                {s.title}
              </span>
              <span className="mt-1 block text-[13px] leading-relaxed text-fd-muted-foreground">{s.body}</span>
            </button>
          </li>
        ))}
      </ol>
    </figure>
  );
}
