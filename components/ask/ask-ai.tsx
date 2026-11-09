'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Check, Copy, LoaderCircle } from 'lucide-react';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/cn';
import { appName, siteUrl } from '@/lib/shared';

/**
 * "Hỏi AI" (/hoi-ai). Step 1: the reader types a question. Step 2: the wiki's
 * own search (Fumadocs, /api/search) lists matching pages and passages as they
 * type. Step 3: they pick their AI app and take the question there, with links
 * to llms.txt and the matching pages' Markdown so the AI reads the wiki first.
 * No AI runs on our side.
 */

interface Result {
  id: string;
  url: string;
  type: 'page' | 'heading' | 'text';
  content: string;
  breadcrumbs?: string[];
}

interface Group {
  url: string;
  title: string;
  breadcrumbs: string[];
  hits: Result[];
}

interface AiApp {
  id: string;
  name: string;
  /** opened when the app can't take the question in its link */
  home?: string;
  /**
   * Opens the app with the question already typed. ChatGPT and Claude are the
   * links Fumadocs' own page actions use; Perplexity and Grok are reported to
   * work. The question is copied as well, in case the box comes up empty.
   */
  prefill?: (prompt: string) => string;
}

const APPS: AiApp[] = [
  { id: 'chatgpt', name: 'ChatGPT', prefill: (q) => `https://chatgpt.com/?${new URLSearchParams({ q, hints: 'search' })}` },
  { id: 'gemini', name: 'Gemini', home: 'https://gemini.google.com/app' },
  { id: 'claude', name: 'Claude', prefill: (q) => `https://claude.ai/new?${new URLSearchParams({ q })}` },
  { id: 'perplexity', name: 'Perplexity', prefill: (q) => `https://www.perplexity.ai/search?${new URLSearchParams({ q })}` },
  { id: 'grok', name: 'Grok', prefill: (q) => `https://grok.com/?${new URLSearchParams({ q })}` },
  { id: 'deepseek', name: 'DeepSeek', home: 'https://chat.deepseek.com/' },
  { id: 'other', name: 'Ứng dụng khác' },
];

const APP_KEY = 'eth-ask-app';
const EXAMPLES = ['Vì sao phải trả phí gas?', 'Mất cụm từ khôi phục thì sao?', 'Layer 2 có an toàn không?', 'Stablecoin có bị đóng băng không?'];
/** pages named in the prompt */
const PROMPT_PAGES = 3;
const isLocalSite = /\/\/(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(siteUrl);

/* ---------- text helpers ---------- */

/** Vietnamese without diacritics, lower case: "Phí" → "phi", "Đồng" → "dong". */
const fold = (s: string) =>
  s.normalize('NFD').replace(/\p{M}/gu, '').replace(/[đĐ]/g, 'd').toLowerCase();

/** `map` one UTF-16 unit at a time, so positions still line up with the original text. */
function aligned(s: string, map: (unit: string) => string) {
  let out = '';
  for (const unit of s.split('')) {
    const m = map(unit);
    out += m.length === 1 ? m : m.length === 0 ? '\u0000' : m[0];
  }
  return out;
}

/** Question words not worth highlighting (compared with their diacritics, so "bán" stays). */
const STOP = new Set(
  'là gì có không của và thì sao vì tại cho được các những một này đó khi nào như thế bị làm để tôi bạn phải về với trong hay nếu ở mà đâu nên'.split(
    ' ',
  ),
);

/**
 * Words to highlight. Diacritics change the word in Vietnamese ("đóng" is not
 * "đồng"), so a word typed with them must match exactly; one typed without
 * them ("phi gas") matches any accented form.
 */
interface Term {
  value: string;
  exact: boolean;
}

function queryTerms(query: string): Term[] {
  const terms = new Map<string, Term>();
  for (const word of query.normalize('NFC').toLowerCase().split(/[^\p{L}\p{N}]+/u)) {
    if (word.length < 2 || STOP.has(word)) continue;
    const exact = fold(word) !== word;
    const value = exact ? word : fold(word);
    terms.set(value, { value, exact });
  }
  return [...terms.values()];
}

const isWordChar = (c: string | undefined) => c !== undefined && /[\p{L}\p{N}]/u.test(c);

/** Where the query's words occur in `text`, as whole words. */
function matchRanges(text: string, terms: Term[]) {
  const lower = aligned(text, (u) => u.toLowerCase());
  const folded = aligned(text, fold);
  const ranges: [number, number][] = [];
  for (const { value, exact } of terms) {
    const hay = exact ? lower : folded;
    for (let i = hay.indexOf(value); i !== -1; i = hay.indexOf(value, i + 1)) {
      if (!isWordChar(hay[i - 1]) && !isWordChar(hay[i + value.length])) ranges.push([i, i + value.length]);
    }
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const r of ranges) {
    const last = merged.at(-1);
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([r[0], r[1]]);
  }
  return merged;
}

/** Search results are Markdown: keep the words. A table row keeps its cells, without the header. */
function plainText(markdown: string) {
  let s = markdown.trim();
  if (s.startsWith('|')) {
    const rows = s.split('\n').filter((line) => line.trim().startsWith('|') && !/^\|[\s:|-]+\|$/.test(line.trim()));
    s = (rows.at(-1) ?? '')
      .split('|')
      .map((cell) => cell.trim())
      .filter(Boolean)
      .join(' · ');
  }
  return s
    .replace(/<[^>]+>/g, ' ')
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/\*\*|__|`/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** A window of `text` around its first match. */
function snippet(text: string, terms: Term[], max = 240) {
  if (text.length <= max) return text;
  const first = matchRanges(text, terms)[0]?.[0] ?? 0;
  let start = Math.max(0, first - 60);
  if (start > 0) start = text.indexOf(' ', start) + 1 || start;
  let end = Math.min(text.length, start + max);
  if (end < text.length) end = Math.max(text.lastIndexOf(' ', end), start + 1);
  return `${start > 0 ? '…' : ''}${text.slice(start, end)}${end < text.length ? '…' : ''}`;
}

function Highlight({ text, terms }: { text: string; terms: Term[] }) {
  const parts: ReactNode[] = [];
  let at = 0;
  for (const [start, end] of matchRanges(text, terms)) {
    if (start > at) parts.push(text.slice(at, start));
    parts.push(
      <mark key={start} className="bg-fd-primary/15 text-fd-foreground">
        {text.slice(start, end)}
      </mark>,
    );
    at = end;
  }
  parts.push(text.slice(at));
  return <>{parts}</>;
}

/** The API lists each page followed by its matching passages; keep the first few of each. */
function groupResults(results: Result[], maxGroups = 5, maxHits = 2) {
  const groups: Group[] = [];
  for (const r of results) {
    if (r.type === 'page') {
      if (groups.length >= maxGroups) break;
      // the page tree's root name ("Wiki ETH.vn") starts every trail: leave it out
      const breadcrumbs = (r.breadcrumbs ?? []).filter((b) => b !== appName);
      groups.push({ url: r.url, title: r.content, breadcrumbs, hits: [] });
    } else {
      const group = groups.at(-1);
      if (group && group.hits.length < maxHits) group.hits.push(r);
    }
  }
  return groups;
}

/** What the reader takes to their AI app, in Vietnamese. */
function buildPrompt(question: string, pages: Group[]) {
  const lines = [
    question.trim(),
    '',
    'Hãy trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu, dựa trên Wiki ETH.vn (bách khoa toàn thư mở về Ethereum bằng tiếng Việt).',
    `- Mục lục của wiki, có đường dẫn tới từng bài: ${siteUrl}/llms.txt`,
  ];
  if (pages.length > 0) {
    lines.push('- Các bài có thể liên quan:');
    for (const page of pages.slice(0, PROMPT_PAGES)) lines.push(`  - ${page.title}: ${siteUrl}${page.url}.md`);
  }
  lines.push('Đọc các bài đó trước khi trả lời. Ghi rõ bài nào bạn đã dùng, và nói rõ nếu wiki không đề cập tới điều tôi hỏi.');
  return lines.join('\n');
}

/* ---------- component ---------- */

export function AskAi() {
  const [question, setQuestion] = useState('');
  const [groups, setGroups] = useState<Group[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [appId, setAppId] = useState<string>();
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const promptRef = useRef<HTMLPreElement>(null);

  const trimmed = question.trim();
  const terms = useMemo(() => queryTerms(trimmed), [trimmed]);
  const prompt = useMemo(() => buildPrompt(trimmed, groups ?? []), [trimmed, groups]);
  const app = APPS.find((a) => a.id === appId);

  // a shared link (/hoi-ai?q=…) and the app picked last time
  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get('q');
    if (q) setQuestion(q);
    try {
      const saved = localStorage.getItem(APP_KEY);
      if (saved && APPS.some((a) => a.id === saved)) setAppId(saved);
    } catch {
      // storage blocked: start with no app picked
    }
  }, []);

  // search as the reader types
  useEffect(() => {
    if (trimmed.length < 2) {
      setGroups(null);
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?${new URLSearchParams({ query: trimmed })}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`search ${res.status}`);
        setGroups(groupResults(await res.json()));
        setFailed(false);
      } catch {
        if (!controller.signal.aborted) setFailed(true);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 250);
    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [trimmed]);

  // keep the question in the address bar, so the page can be shared as it is
  useEffect(() => {
    const timer = setTimeout(() => {
      const url = new URL(window.location.href);
      if (trimmed) url.searchParams.set('q', trimmed);
      else url.searchParams.delete('q');
      window.history.replaceState(null, '', url);
    }, 400);
    return () => clearTimeout(timer);
  }, [trimmed]);

  useEffect(() => {
    setCopied(false);
    setCopyFailed(false);
  }, [prompt]);

  function chooseApp(id: string) {
    setAppId(id);
    try {
      localStorage.setItem(APP_KEY, id);
    } catch {
      // not remembered, nothing else changes
    }
  }

  async function copyPrompt() {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setCopyFailed(false);
    } catch {
      // no clipboard access: select the text so the reader can copy it by hand
      if (promptRef.current) window.getSelection()?.selectAllChildren(promptRef.current);
      setCopyFailed(true);
    }
  }

  return (
    <div className="mt-8 flex flex-col gap-10">
      {/* 1. question */}
      <section aria-labelledby="ask-step-1">
        <StepTitle id="ask-step-1" n={1}>
          Câu hỏi của bạn
        </StepTitle>
        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => {
            // a question is one line; Shift+Enter still breaks it
            if (e.key === 'Enter' && !e.shiftKey) e.preventDefault();
          }}
          rows={3}
          maxLength={500}
          placeholder="Ví dụ: Vì sao giao dịch trên Ethereum không đảo ngược được?"
          aria-labelledby="ask-step-1"
          className="w-full resize-y border border-fd-border bg-fd-card px-3 py-2.5 text-base outline-none placeholder:text-fd-muted-foreground focus-visible:border-fd-ring focus-visible:ring-1 focus-visible:ring-fd-ring/50"
        />
        {/* examples only while the box is empty: on phones they would push the results down */}
        {!trimmed && (
          <div className="mt-3 flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <button
                key={example}
                type="button"
                onClick={() => setQuestion(example)}
                className={buttonVariants({ variant: 'outline', size: 'sm', className: 'font-normal' })}
              >
                {example}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* 2. wiki search */}
      <section aria-labelledby="ask-step-2" aria-busy={loading}>
        <StepTitle id="ask-step-2" n={2}>
          Bài liên quan trong wiki
        </StepTitle>
        {loading && groups === null ? (
          <p className="flex items-center gap-2 text-sm text-fd-muted-foreground">
            <LoaderCircle className="size-4 animate-spin" /> Đang tìm…
          </p>
        ) : failed ? (
          <p className="text-sm text-fd-muted-foreground">Không tìm được lúc này. Bạn vẫn có thể hỏi AI ở bước 3.</p>
        ) : groups === null ? (
          <p className="text-sm text-fd-muted-foreground">Kết quả hiện ngay khi bạn gõ.</p>
        ) : groups.length === 0 ? (
          <p className="text-sm text-fd-muted-foreground">Wiki chưa có bài nào khớp với câu hỏi. Bạn vẫn có thể hỏi AI ở bước 3.</p>
        ) : (
          <ol className={cn('flex flex-col gap-3 transition-opacity', loading && 'opacity-60')}>
            {groups.map((group) => (
              <li key={group.url} className="border border-fd-border bg-fd-card p-4">
                {group.breadcrumbs.length > 0 && (
                  <p className="text-xs text-fd-muted-foreground">{group.breadcrumbs.join(' › ')}</p>
                )}
                <Link href={group.url} className="mt-0.5 inline-block font-semibold underline-offset-4 hover:underline">
                  <Highlight text={group.title} terms={terms} />
                </Link>
                {group.hits.length > 0 && (
                  <ul className="mt-2 flex flex-col gap-2">
                    {group.hits.map((hit) => {
                      const text = plainText(hit.content);
                      return (
                        <li key={hit.id}>
                          <Link
                            href={hit.url}
                            className="block border-l-2 border-fd-border ps-3 text-sm text-fd-muted-foreground hover:border-fd-primary hover:text-fd-foreground"
                          >
                            {hit.type === 'heading' && <span aria-hidden>§ </span>}
                            <Highlight text={hit.type === 'heading' ? text : snippet(text, terms)} terms={terms} />
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            ))}
          </ol>
        )}
      </section>

      {/* 3. take it to an AI app */}
      <section aria-labelledby="ask-step-3">
        <StepTitle id="ask-step-3" n={3}>
          Hỏi AI bạn quen dùng
        </StepTitle>
        <p className="mb-3 text-sm text-fd-muted-foreground">
          Chọn ứng dụng AI. Câu hỏi được gửi kèm đường dẫn tới wiki để AI đọc trước khi trả lời.
        </p>
        <div role="radiogroup" aria-label="Ứng dụng AI" className="flex flex-wrap gap-2">
          {APPS.map((a) => (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={a.id === appId}
              onClick={() => chooseApp(a.id)}
              className={buttonVariants({
                variant: a.id === appId ? 'default' : 'outline',
                className: 'h-9 px-3',
              })}
            >
              {a.name}
            </button>
          ))}
        </div>

        {app && (
          <div className="mt-4 border border-fd-border bg-fd-card p-4">
            {!trimmed ? (
              <p className="text-sm text-fd-muted-foreground">Gõ câu hỏi ở bước 1 trước.</p>
            ) : app.prefill ? (
              <>
                <a
                  href={app.prefill(prompt)}
                  target="_blank"
                  rel="noopener noreferrer"
                  // copied too, in case the app opens with an empty box
                  onClick={() => void navigator.clipboard?.writeText(prompt).then(() => setCopied(true), () => {})}
                  className={buttonVariants({ size: 'lg' })}
                >
                  Mở {app.name} với câu hỏi này
                  <ArrowUpRight data-icon="inline-end" />
                </a>
                <p className="mt-3 text-sm text-fd-muted-foreground">
                  Câu hỏi được điền sẵn trong {app.name}. Nếu ô chat trống (thường gặp khi mở bằng ứng dụng trên điện thoại),
                  câu hỏi cũng đã được chép: chỉ cần dán vào rồi gửi.
                </p>
                <CopyButton copied={copied} onCopy={copyPrompt} variant="outline" className="mt-3" />
              </>
            ) : (
              <ol className="flex flex-col gap-3 text-sm">
                <li className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span>1.</span>
                  <CopyButton copied={copied} onCopy={copyPrompt} />
                </li>
                <li className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <span>2.</span>
                  {app.home ? (
                    <a href={app.home} target="_blank" rel="noopener noreferrer" className={buttonVariants({ variant: 'outline' })}>
                      Mở {app.name}
                      <ArrowUpRight data-icon="inline-end" />
                    </a>
                  ) : (
                    <span>Mở ứng dụng AI bạn dùng (Copilot, Meta AI…).</span>
                  )}
                </li>
                <li className="flex gap-3">
                  <span>3.</span>
                  <span>Dán vào ô chat rồi gửi. Trên điện thoại: chạm giữ ô chat, chọn Dán.</span>
                </li>
              </ol>
            )}
            {copyFailed && (
              <p className="mt-3 text-sm text-fd-muted-foreground">
                Trình duyệt không cho chép tự động. Nội dung bên dưới đã được bôi đen: hãy chép bằng tay.
              </p>
            )}
          </div>
        )}

        {trimmed && (
          <details className="mt-4 text-sm" open={copyFailed || undefined}>
            <summary className="cursor-pointer text-fd-muted-foreground">Xem nội dung sẽ gửi cho AI</summary>
            <pre
              ref={promptRef}
              className="mt-2 max-h-72 overflow-auto border border-fd-border bg-fd-secondary/50 p-3 text-xs leading-relaxed whitespace-pre-wrap"
            >
              {prompt}
            </pre>
          </details>
        )}
        {isLocalSite && (
          <p className="mt-3 text-xs text-fd-muted-foreground">
            Đang chạy thử trên máy: ứng dụng AI không mở được các đường dẫn localhost trong câu hỏi. Đặt
            NEXT_PUBLIC_SITE_URL khi triển khai.
          </p>
        )}
      </section>

      <section className="border-t border-fd-border pt-6 text-sm text-fd-muted-foreground">
        <ul className="flex list-disc flex-col gap-2 ps-5">
          <li>
            <strong className="text-fd-foreground">Không bao giờ dán cụm từ khôi phục hay khóa riêng tư</strong> vào bất kỳ ô
            chat nào, kể cả với AI.
          </li>
          <li>AI có thể trả lời sai. Đối chiếu với bài gốc trên wiki, nhất là với những gì liên quan tới tiền.</li>
          <li>
            Wiki ETH.vn không chạy AI. Khi bạn mở một ứng dụng AI, câu hỏi được gửi tới ứng dụng đó và tuân theo chính sách
            của họ.
          </li>
        </ul>
      </section>
    </div>
  );
}

function StepTitle({ id, n, children }: { id: string; n: number; children: ReactNode }) {
  return (
    <h2 id={id} className="mb-3 flex items-center gap-2.5 text-base font-semibold">
      <span className="flex size-6 items-center justify-center bg-fd-primary text-xs text-fd-primary-foreground">{n}</span>
      {children}
    </h2>
  );
}

function CopyButton({
  copied,
  onCopy,
  variant = 'default',
  className,
}: {
  copied: boolean;
  onCopy: () => void;
  variant?: 'default' | 'outline';
  className?: string;
}) {
  return (
    <button type="button" onClick={onCopy} className={buttonVariants({ variant, className })} aria-live="polite">
      {copied ? <Check data-icon="inline-start" /> : <Copy data-icon="inline-start" />}
      {copied ? 'Đã chép câu hỏi' : 'Chép câu hỏi'}
    </button>
  );
}
