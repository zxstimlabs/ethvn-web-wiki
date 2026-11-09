import { type CSSProperties, type ComponentProps, Fragment } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/cn';
import { type Frame, TALL, WIDE } from './layout';

/**
 * shadcn's Skeleton, tinted with muted-foreground: plain `muted` is almost
 * white in light mode and the small blocks would disappear.
 */
function Bone({ className, ...props }: ComponentProps<typeof Skeleton>) {
  return <Skeleton aria-hidden className={cn('bg-muted-foreground/15 motion-reduce:animate-none', className)} {...props} />;
}

/** A part of the network: a block with a caption bar under it. */
function Part({ box, bar = 'w-12', style }: { box: string; bar?: string; style: CSSProperties }) {
  return (
    <div className="absolute flex flex-col items-center gap-1.5" style={style}>
      <Bone className={box} />
      <Bone className={cn('h-2', bar)} />
    </div>
  );
}

/**
 * A loose stand-in for the scene, not a tracing of it: the chain on top, the
 * 2/3 gauge, then the network's parts scattered over the rest (the node with
 * its modules, the wallet, other nodes, builders, the relay, the committee).
 * Positions are percentages, so the same arrangement fills both the tall and
 * the wide box.
 */
function SceneSkeleton() {
  return (
    <div className="flex aspect-(--tall) w-full flex-col gap-5 p-4 md:aspect-(--wide) md:gap-6 md:p-8">
      {/* chain: finalized · justified · recent blocks */}
      <div className="flex items-end gap-2 md:gap-3">
        {Array.from({ length: 5 }, (_, i) => (
          <Fragment key={i}>
            {i > 0 && <Bone className={cn('mb-[15px] h-0.5 flex-1 md:mb-[23px]', i === 2 && 'opacity-40')} />}
            <div className="flex flex-col items-center gap-1.5">
              <Bone className="h-2 w-10 md:w-16" />
              <Bone className="size-8 md:size-12" />
            </div>
          </Fragment>
        ))}
      </div>

      {/* the 2/3 gauge */}
      <div className="space-y-2">
        <Bone className="h-2 w-36 md:w-52" />
        <div className="flex items-center gap-2">
          <Bone className="h-1.5 w-1/2 md:w-1/3" />
          <Bone className="h-2 w-8" />
        </div>
      </div>

      {/* the network */}
      <div className="relative flex-1">
        {/* the node, with its six modules */}
        <div className="absolute flex flex-col items-center gap-2" style={{ left: '9%', bottom: '2%' }}>
          <Bone className="grid w-32 grid-cols-3 gap-1.5 p-2 md:w-44 md:gap-2 md:p-3">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="aspect-[4/3] bg-muted-foreground/20" />
            ))}
          </Bone>
          <Bone className="h-2.5 w-28" />
        </div>
        <Part style={{ left: '0%', bottom: '10%' }} box="h-10 w-4 md:h-12 md:w-5" bar="w-5" />

        {/* other nodes */}
        <Part style={{ left: '4%', top: '30%' }} box="size-7 md:size-9" />
        <Part style={{ left: '27%', top: '50%' }} box="size-7 md:size-9" bar="w-16" />

        {/* builders, with their label */}
        <Bone className="absolute h-2.5 w-24" style={{ left: '4%', top: '6%' }} />
        <Part style={{ left: '40%', top: '2%' }} box="h-9 w-10 md:h-12 md:w-14" bar="w-10" />
        <Part style={{ left: '54%', top: '20%' }} box="h-9 w-10 md:h-12 md:w-14" bar="w-10" />
        <Part style={{ left: '66%', top: '40%' }} box="h-9 w-10 md:h-12 md:w-14" bar="w-10" />

        {/* the relay node and its bid board */}
        <div className="absolute flex items-end gap-2" style={{ right: '2%', bottom: '4%' }}>
          <div className="flex flex-col items-end gap-1.5">
            <Bone className="h-2 w-16" />
            <Bone className="h-2 w-12" />
            <Bone className="h-2 w-12" />
          </div>
          <div className="flex flex-col items-center gap-1.5">
            <Bone className="flex gap-1 p-1.5">
              <div className="size-5 bg-muted-foreground/20 md:size-6" />
              <div className="size-5 bg-muted-foreground/20 md:size-6" />
            </Bone>
            <Bone className="h-2 w-14" />
          </div>
        </div>

        {/* the committee */}
        <div className="absolute flex flex-col items-center gap-2" style={{ right: '2%', top: '0%' }}>
          <div className="grid grid-cols-4 gap-1">
            {Array.from({ length: 7 }, (_, i) => (
              <Bone key={i} className="size-4 md:size-6" />
            ))}
          </div>
          <Bone className="h-2 w-12" />
        </div>
      </div>
    </div>
  );
}

const ratio = (f: Frame) => `${f[2]} / ${f[3]}`;

/**
 * Stands in for the hero until the client knows which version to show. It
 * takes its shape from CSS breakpoints (the phone version below `md`, the
 * landscape one above), with the scene box at the same size as the real one,
 * so nothing jumps when the scene mounts.
 */
export function HeroSkeleton() {
  return (
    <figure
      aria-busy="true"
      className="mx-auto max-w-[440px] border border-fd-border bg-fd-background md:max-w-none"
      style={{ '--tall': ratio(TALL.frame), '--wide': ratio(WIDE.frame) } as CSSProperties}
    >
      <figcaption className="sr-only">Đang tải hình minh hoạ…</figcaption>

      {/* the slot clock row and its progress line, same box as the real ones */}
      <div className="flex items-center justify-between gap-3 border-b border-fd-border px-3 py-2 text-[11px]">
        <Bone className="h-[1lh] w-28" />
        <Bone className="h-[1lh] w-32 md:w-72" />
      </div>
      <div className="h-px bg-fd-border" />

      <SceneSkeleton />

      {/* phone: the "+" bar under the scene */}
      <div className="flex justify-center border-t border-fd-border px-3 py-2.5 text-[11px] md:hidden">
        <Bone className="h-[1lh] w-52" />
      </div>

      {/* steps: one card on phones, the 3 × 2 grid above */}
      <div className="grid border-t border-fd-border md:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <div
            key={i}
            className={cn(
              'space-y-2 border-fd-border p-4',
              i > 0 && 'max-md:hidden',
              i % 3 !== 0 && 'md:border-l',
              i >= 3 && 'md:border-t',
            )}
          >
            <Bone className="h-3 w-10" />
            <Bone className="h-4 w-36" />
            <Bone className="h-3.5 w-full" />
            <Bone className="h-3.5 w-full" />
            <Bone className="h-3.5 w-2/3" />
          </div>
        ))}
      </div>

      <div className="space-y-1.5 border-t border-fd-border px-4 py-3">
        <Bone className="h-3 w-full" />
        <Bone className="h-3 w-4/5" />
      </div>
    </figure>
  );
}
