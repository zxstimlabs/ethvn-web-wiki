# ethvn-web-wiki: notes for Claude

The Vietnamese Ethereum wiki for ETH.vn. Readers should be able to clone the content as plain markdown and chat about a page using their own AI. The ETH.vn wallet is the main site and the wiki goes on a subdomain (exact domains not decided yet).

Created on 2026-11-08 with `bunx create-fumadocs-app ethvn-web-wiki -y --install` (default template). Versions: Next 16.4, fumadocs-core 16.17, `fumadocs-ui` aliased to `@fumadocs/base-ui`, fumadocs-mdx 15.4, Tailwind 4, TypeScript 7.

## Rules

- **Bun only, never Node.** Use `bun install`, `bun run dev | build | start | types:check` and `bunx --bun …`. The scripts already run `bun --bun next …`, so Next runs on Bun's runtime instead of its Node shebang. Don't use npx, node, or an nvm Node on PATH. If a tool fails under Bun, stop and tell the user instead of falling back to Node. (`create-fumadocs-app` itself failed under Bun 1.4.2 because it imports `findPackageJSON` from `node:module`.)
- Pages are `.mdx`, with stock Fumadocs MDX behaviour. The user decided this on 2026-11-08 so pages can hold interactive components that demonstrate ideas. Write callouts as `<Callout type="warn" title="Cảnh báo">`, not `> [!WARNING]`, and add no custom remark plugins unless asked. Register reusable components in `components/mdx.tsx`.
- Follow `CONTRIBUTING.md` (Vietnamese) for the section plan, file conventions, writing style and standard terms. It moved here from the old `ethvn-wiki-contents/README.md` and includes later decisions: finality is "tính cuối cùng" (user decision 2026-11-08), never a standalone "cuối cùng", which can read as "last".
- ethereum.org's terms of use license its text (non-code content) under **CC BY 4.0** and its code under MIT; its GitHub repo says MIT. `NOTICE.md` (updated 2026-11-09) meets both: credit, licence links, a note of changes, and no endorsement claimed. Keep it whenever adapted content is in this repo.
- The Ethereum Foundation's public-sector site and PDFs state no licence: summarise and cite them, never copy.
- Don't touch the wallet at `~/dev/zxstimlabs/ethvn-web-wallet`: the user is reviewing it.
- Commit only when the user asks.

## Related folders

| Path | What it is |
|---|---|
| `~/dev/zxstimlabs/references/ethereum-org-website` | Reference content (MIT). Draft new pages from it. |
| `~/dev/ethvn-projects/ethvn-home` | eth.vn home site (Next 16, shadcn `base-lyra`, Noto Sans + Geist Mono). Match its look. |
| `~/dev/vietpay/internal-docs` | Has a `remarkGithubAlerts` plugin for `> [!NOTE]` callouts. It was tried here and then dropped for stock MDX. |
| `~/dev/zxstimlabs/ethvn-main-website` | Earlier scaffold with a Vietnamese glossary from ethereum.org/vi. Role undecided. |

## Current state (2026-11-08)

- Uncommitted so far (check `git status`): the Bun scripts in `package.json`, the home hero, the shadcn theme, and the content.
- Sections (user's request, 2026-11-08): the wiki is split by reader into five Fumadocs root folders, shown as the dropdown at the top of the sidebar (like fumadocs.dev). In the phone drawer it's at the top with descriptions, and the intro page lists them as cards.
  - "Căn bản" (`content/docs/can-ban/`) is general, simplified content for everyone. It has its own URL, `/tai-lieu/can-ban`, so it can be indexed and shared (user's request, 2026-11-08). Its front page is titled "Căn bản" and also lists the other sections as cards.
  - "Lập trình viên" (`lap-trinh-vien/`) is still a plain placeholder.
  - "Nhà đầu tư" (`nha-dau-tu/`, 9 pages) was written on 2026-11-09 at the user's request. It elaborates Vitalik Buterin's X thread of 2026-11-08 (https://x.com/VitalikButerin/status/2119401255919604064): ETH as a store of value, not a fee-burning token.
    - Supporting sources: ethereum.org, including the EF Mandate (Mar 2026), which defines CROPS and calls ether a store of value. Live figures are dated: ultrasound.money, validatorqueue.com, DefiLlama, rwa.xyz, Coin Metrics.
    - The user wants it attractive to investors. It presents the thesis persuasively but attributed, with a risks-and-counterviews page (`rui-ro-va-quan-diem-khac`).
    - No buy advice and no price predictions (CONTRIBUTING rule).
    - Figures that go stale fastest: supply, burn by year, stake, APR, drawdowns, stablecoin and RWA totals. Refresh them with dates.
  - "Doanh nghiệp" (`doanh-nghiep/`, 7 pages) and "Chính phủ" (`chinh-phu/`, 10 pages) were written on 2026-11-09 at the user's request. Sources: ethereum.org/organizations/enterprise (and its sub-pages) and publicsector.ethereum.foundation. Neither is in the local clone (Sep 2026), so research agents read the live sites.
    - Doanh nghiệp's emphasis (user): L2 use, how customizable L2s are, compliance, verifiability, neutral block space. Its pages:
      - khong-gian-khoi-trung-lap, kiem-chung, layer-2-cho-doanh-nghiep (with ETHBEAT stages and corporate L2s);
      - tuy-chinh-layer-2 (OP Stack, Arbitrum, ZK Stack/Prividium, Polygon CDK, from their docs);
      - tuan-thu, token-hoa-va-thanh-toan.
    - Chính phủ's emphasis (user): neutral global block space, with no major power able to meddle (`trung-lap-toan-cau`, page 2), plus the EF research. Every claim is attributed, and ended pilots are named (OpenCerts left Ethereum in 2025, Canada NRC ended in 2019).
    - Pages in both sections end with a visible "Nguồn" list. Search skips it, like "Đọc tiếp" and "Đọc theo thứ tự".
    - Vietnamese law is named but never ruled on: Luật Bảo vệ dữ liệu cá nhân 91/2025/QH15, Luật Công nghiệp công nghệ số 71/2025/QH15, Nghị quyết 05/2025/NQ-CP.
    - L2BEAT renamed itself ETHBEAT (ethbeat.org; l2beat.com 301-redirects there, checked 2026-11-09). Write "ETHBEAT (trước đây là L2BEAT)" on first mention.
  - "Chính phủ" was "Nhà nước" (`nha-nuoc/`) until 2026-11-09; `next.config.mjs` redirects the old URLs.
  - A page outside every root folder gets no dropdown, so `/tai-lieu` has no page of its own. It redirects to `/tai-lieu/can-ban`; so do "Đọc wiki" and `docsHome` in `lib/shared.ts`.
  - Code: `lib/sections.tsx` (tab icon tint via `DocsLayout`'s `tabs.transform`, and `getSections()`), `components/section-cards.tsx` (`<SectionCards />`, registered in `components/mdx.tsx`). Colours are `--section-<folder>` in `app/global.css`, taken from the hero palette. Icons are Lucide names from `meta.json`; the name must exist in `lucide-react`'s `icons` (`Building2` doesn't, `Building` does).
  - After moving or adding content folders, the dev server's MDX loader can crash ("Node.js subprocess crashed … fumadocs-mdx"). Stop the dev server, delete `.next/dev` and start it again.
- Content lives only in `content/docs/`. Căn bản has a front page and three groups: Bắt đầu, Cách hoạt động, Dùng Ethereum. The other sections are placeholders.
- Cách hoạt động (`can-ban/cach-hoat-dong/`, user's request 2026-11-08): beginner pages adapted from ethereum.org's developer docs.
  - Cách hoạt động pages, in order: chuỗi khối, nút, đồng thuận, trình xác thực, địa chỉ và khóa, chữ ký số, hợp đồng thông minh, gas, khối, Layer 2, nâng cấp, plus an intro. Each has an isometric animation.
  - Dùng Ethereum (`can-ban/dung-ethereum/`, user's request 2026-11-08) has đọc một giao dịch, token/stablecoin/NFT, ví thông minh and quyền riêng tư, plus an intro; each has an animation. Facts come from the same ethereum.org clone.
  - `eip-7702` and `erc-4337` (user's request 2026-11-09) sit after ví thông minh. Facts were checked against the EIP texts, the ethereum.org clone and eth-infinitism releases on 2026-11-09.
    - ethereum.org is stale here: it calls 7702 delegation "temporary" (it persists), says validators bundle UserOperations (bundlers do), and still calls Pectra "scheduled".
    - Dated figures to refresh: BundleBear all-time UserOperations (≈1,36 tỷ, World Chain 56%, Base 24%, Polygon 10%, mainnet 0,6%; read 2026-11-09), the gas-checker numbers from EntryPoint v0.9.0, Wintermute's ">97% sweeper delegations" (Cointelegraph, 2 Jun 2025), and EIP-8141's status (scheduled for Hegotá since Aug 2026, still Draft; Hegotá expected Q2 2027, not confirmed).
  - ethereum.org leaves some things out, and these pages state them carefully: that NFT images usually live off-chain, that royalties aren't enforced by the protocol, and that stablecoin issuers can freeze tokens.
  - It is also out of date on EIP-7702; the pages cover that an upgraded account's original key keeps full control.
  - Glamsterdam is described as planned, not live (as of November 2026).
  - Smart contracts, consensus, validators and gas were added on the user's request.
  - Layer 2 (user's request, 2026-11-09) covers the L2 types: why data on Ethereum matters, optimistic rollups (bisection fraud proofs, bond, challenge period), ZK-rollups (validity proofs, recursion, SNARK vs STARK, zkEVM), a comparison table, then validium, optimium, sidechains, plasma and state channels in one table. Base's ZK + TEE multiproof is the "line is blurring" callout.
    - Per-network facts come from ETHBEAT, read 2026-11-09, and are dated in the text: Arbitrum One challenge 6d 8h; Base 5d (1d when both proofs agree); ZKsync Era 1-day execution delay; ZKsync Era and Scroll wrap STARKs in SNARKs; Arbitrum Nova moved from optimium to optimistic rollup on 2026-08-31. Polygon zkEVM is now "Other" (proof system removed Dec 2025), so it isn't a ZK example. Refresh these with dates.
  - Đồng thuận covers the Byzantine Generals Problem, which ethereum.org barely covers, so it cites Lamport et al. 1982; then proof of work, then proof of stake.
  - Trình xác thực covers why stake is required and how global the network is.
  - Gas covers why gas exists; `bat-dau/phi-gas` covers how to pay less.
  - Node geography comes from Ethernodes, read in Chrome on 2026-11-08 (WebFetch gets a 403): 8.717 execution nodes in 95 countries and territories, 4.886 consensus nodes in 72, US about 30%, Germany about 14%, Vietnam 24. These figures go stale, so refresh them and keep the date in the text.
  - Facts came from the ethereum.org clone at commit 027a25f99f (Sep 2026). Where ethereum.org is inconsistent or stale, the pages avoid hard numbers or date them; for example, the block gas limit is given as "60 million at the end of 2025, rising".
  - ethereum.org's Vietnamese uses "tính chung cuộc" and "điểm kiểm tra"; this wiki keeps "tính cuối cùng" and "mốc" (user's choices). "Blob" stays untranslated.
- Isometric explainers for wiki pages live in `components/iso/` and are registered in `components/mdx.tsx`: `ChainScene`, `NodeScene`, `ByzantineScene`, `ConsensusScene` (Công việc / Cổ phần switch), `ValidatorsScene` (stylised world map, continents placed by longitude/latitude), `KeysScene`, `SignatureScene`, `ContractScene`, `GasScene`, `BlockAnatomy`, `RollupScene` (Lạc quan / ZK switch), `UpgradeScene`, `ExplorerScene` (a generic explorer, deliberately not Etherscan's look), `TokenScene` (Token / Stablecoin / NFT switch), `SmartWalletScene` (Ví thường / Ví thông minh switch), `PrivacyScene`.
  - Added 2026-11-09 (user's request: more diagrams in Căn bản, so Bắt đầu has them too): `FinalityScene` (khoi, new section "Khi nào khối không thể đảo ngược?"), `FeeMarketScene` (phi-gas: base fee ±12,5% per block), `RecoveryScene` (vi-va-tai-khoan; Mất điện thoại / Lộ cụm từ switch), `NetworksScene` (vi-va-tai-khoan, new section "Một địa chỉ, nhiều mạng"), `ApprovalScene` (giu-an-toan; Không giới hạn / Vừa đủ switch), `PoisoningScene` (giu-an-toan), `SupplyScene` (ether-la-gi; mechanism only, no figures), `DelegationScene` (eip-7702), `UserOpScene` (erc-4337).
  - The hero's finality "+" buttons (`READ.finality` in `components/hero/content.ts`) now point at the khoi finality section.
  - `figure.tsx` (`IsoFigure`) wraps each one: play/pause, a progress line and clickable step captions. Captions sit side by side by container width (container queries).
  - Each scene is a pure function of `t` that React re-renders per frame (small SVGs, so that's fine). The server renders a `poster` frame.
  - Autoplay is off for reduced-motion readers, and playback stops off screen. On phones the figure spans the full screen width.
  - `parts.tsx` holds the drawing primitives (Box, Cube, Server, Phone, Arrow, Badge, Card). `iso.css` adds bad/key/l2 tones and labels on top of the hero's `block-scene.css` (figures carry `eth-scene` too).
  - Dev only: `window.__isoT = 6.5` freezes every explainer on the page at that second.
  - Known limit: in-scene labels render about 9 to 11 px on a 390 px phone. The step captions carry the explanation in normal-size text.
  - The hero's "Đọc thêm" links (`MORE` in `components/hero/content.ts`) now point at these pages where they fit.
  - It came from `~/dev/zxstimlabs/ethvn-wiki-contents`, which the user had removed on 2026-11-08 after it was folded in. The folder was moved to the macOS Trash, not deleted, and its README became `CONTRIBUTING.md`.
  - The pages were converted to `.mdx`:
  - The 8 GitHub alerts became `<Callout>`s with Vietnamese titles: NOTE → info "Lưu ý", TIP → idea "Mẹo", IMPORTANT → warn "Quan trọng", WARNING → warn "Cảnh báo", CAUTION → error "Thận trọng".
  - The 21 internal links now point at `./x.mdx`; `createRelativeLink` in the page template turns them into URLs.
  - `lib/source.ts` is the stock template again.
  - `NOTICE.md` is at the repo root, with its path changed to `content/docs/`.
  - The markdown served to AI tools (`.md` routes, `llms-full.txt`) is the processed MDX, so callouts appear there as `<Callout …>` tags.
  - The `sources` frontmatter field is kept in the files but isn't validated or shown on the page.
- Home hero (`app/(home)/page.tsx` → `components/hero/hero.tsx`): an isometric SVG telling one block's story on its own clock. The page has no visible title; the "Đọc wiki" button is in the header (`app/(home)/layout.tsx`). Isometric helpers are in `lib/hero/iso.ts` and the schedule in `lib/hero/timeline.ts`; every frame is a pure function of `t`.
  - Two components, one story (user's request, 2026-11-08): `BlockScene` (landscape, `block-scene.tsx`) and `BlockSceneMobile` (portrait, `block-scene-mobile.tsx`, read bottom to top: wallet and node, network, chain). `hero.tsx` picks one with shadcn's `useIsMobile` (`hooks/use-mobile.ts`, below 768 px).
    - Until the hook has run, the static HTML holds `HeroSkeleton` (`hero-skeleton.tsx`, built on shadcn's `components/ui/skeleton.tsx`; user's request, 2026-11-08). CSS breakpoints give it the phone or landscape shape, with the scene box at the real scene's size, so nothing jumps when the scene mounts. Inside the box it is plain Skeleton blocks loosely standing for the chain, gauge, node, builders, relay and committee (user: no SVG, representative rather than exact). The blocks are tinted `bg-muted-foreground/15` because `muted` is too faint in light mode. Only one version is ever mounted. If the frames or the figure chrome change, keep the skeleton's boxes in step.
    - Shared files: `content.ts` (steps, "+" texts, tour, wiki links), `layout.ts` (all positions: `WIDE` and `TALL`, built by `makeLayout`), `scene.tsx` (drawing), `engine.ts` (animation), `hero-parts.tsx` (`useHero` hook, HUD, popup, tour chip).
    - The tall layout draws about 1:1 on a phone, so its text is larger (`[data-layout='tall']` rules in `block-scene.css`; keep them in step with `TALL.font`). It drops the English sub-labels (the popups carry them) and shows slot numbers only on the head and checkpoints.
    - There is no camera any more: the old panning viewBox for narrow screens was replaced by the tall layout.
  - The loop (`STORY`, `CYCLE` in `timeline.ts`) always starts at step 1 and plays the steps in order. It is **not synced to mainnet's slot timing** (user's request, 2026-11-10). Before that, each real slot opened with the proposal, so viewers saw steps 4, 5, 1, 2, 3, 6 and joined wherever mainnet was. Only the slot numbers come from mainnet, read when each loop starts.
    - Story, 12 s in real time: from 6.4 s into slot S (wallet → node RPC → mempool → P2P → peers → 3 builders, which bid via the relay) to 6.4 s into slot S + 1 (MEV-Boost takes the best bid, the validator signs, the relay publishes, the committee attests). The HUD bar therefore starts about half full.
    - Then a 12 s fast-forward: the network dims, simulated slots run until the block of S + 1 is finalized (64–96 slots), and the 2/3 gauge fills each epoch. Its hand-back shows the next loop's opening frame.
    - The loop's clock pauses while a popup is open or the hero is off screen, and the first frame is drawn in a layout effect, before paint (the static markup is the step-3 still frame, used for reduced motion).
    - Committee votes were tightened (stagger 0.15 s, 0.7 s each) so they finish before the story's end.
  - The node is drawn as a home staker's node (EL: RPC, mempool, P2P; CL: validator, beacon; plus MEV-Boost) whose validator is the proposer. The caption says this is an example.
  - Facts the user had wrong and agreed to correct (2026-11-08):
    - There is no 2/3 rule per block; 2/3 of staked ETH per epoch justifies a checkpoint, and two consecutive justified checkpoints finalize the earlier one.
    - MEV-Boost is only on validator setups.
  - The 2/3 gauge is a model (99% participation), not live data. Bids and transactions are illustrative.
  - Goal (user, 2026-11-08): the animation is illustrative, but it must help viewers understand Ethereum and encourage them to explore further.
  - "+" buttons: 11 on connection lines (`RELATIONS`) and 16 on parts (`ITEMS`) in `content.ts`.
    - Clicking one pauses the scene and opens a popup with the explanation, "Đọc thêm" to an existing wiki page (`MORE`; only pages that exist), and "← Trước / Tiếp →" through `TOUR`.
    - Visited buttons are remembered in localStorage (`eth-hero-seen`, per viewer). A chip shows "x/27".
    - When adding wiki pages (e.g. MEV, finality), link them from `MORE`.
    - Button positions are computed in `makeLayout` from each layout's parts and labels (midpoints of lines, after labels, module corners); `nudge` moves one that collides. Check both layouts after moving anything.
  - Dev only: `window.__ethHeroT = 2` freezes the story 2 s after it starts (0 = step 1, 12 = end); `window.__ethHeroFF = 5` freezes the fast-forward. After hot reloads that change element structure, reload the page: transforms set by the engine survive HMR.
  - It shows builder → relay → MEV-Boost; change the relay steps once ePBS (Glamsterdam) is on mainnet.
  - The relay is drawn as a node (user's request, 2026-11-08): a small platform with a "Relay" module (MEV-Boost relay software, amber) and a "Beacon" module (the full node it uses to check and publish blocks).
    - It is titled "Nút khác" with the description "chạy relay MEV-Boost".
    - Keep it accurate to mainnet today: no ePBS/Glamsterdam claims in the scene or popups until it ships.
    - Fact kept in the popups: a MEV-Boost relay is a third-party node (Flashbots, Ultra Sound…), not something the validator's own node does.
    - Ordinary P2P relaying of transactions and blocks is what every node does.
  - Techniques came from a teardown of Protocol Explorer (`~/dev/ethvn-projects/ethvn-home/docs/protocol-explorer-teardown.md`); none of its drawings or code were copied.
- Placeholders still to replace:
  - `gitConfig` (points at fuma-nama/fumadocs) in `lib/shared.ts`.
  - `README.md`, which tells people to use npm, pnpm or yarn.
- Collections use the **Macro API** in `lib/source.ts` (`defineDocs` from `fumadocs-mdx/macro`). There is no `source.config.ts`; add MDX plugins through `applyMdxPreset` there.
- Theme: shadcn `base-lyra` (done 2026-11-08). The user chose this; don't switch back to a Fumadocs colour preset.
  - `components.json` matches ethvn-home, except `utils` points at `@/lib/cn` (the `cn` package replaces clsx + tailwind-merge). Add components with `bunx --bun shadcn add <name>`; the first was `components/ui/button.tsx`.
  - `app/global.css` imports `shadcn/tailwind.css`, `tw-animate-css` and `fumadocs-ui/css/shadcn.css`, which maps Fumadocs' `--color-fd-*` to shadcn's variables. The colour tokens are copied from ethvn-home.
  - `--radius: 0`, because Lyra is boxy. ethvn-home keeps 0.625rem, but its Lyra components ignore it. A scoped rule also squares the `rounded-full` search box and theme switch that Fumadocs hard-codes in the home header.
  - The user asked for one font everywhere: JetBrains Mono (with the Vietnamese subset), set as `--font-mono` in `app/layout.tsx`. `font-sans` and `font-heading` map to it in `global.css`. Geist Mono, which ethvn-home uses, has no Vietnamese glyphs.
- Routes (user's request, 2026-11-08): the wiki is at `/tai-lieu`, not Fumadocs' default `/docs`; the content folder is still `content/docs`. Landing page at `app/(home)`, search at `/api/search`.
  - Route constants are in `lib/shared.ts`. The route folders are `app/tai-lieu`, `app/llms.mdx/tai-lieu` (Markdown copies) and `app/og/tai-lieu` (share images).
  - `next.config.mjs` permanently redirects `/tai-lieu` to the Căn bản section and every old `/docs/...` URL to its `/tai-lieu/...` equivalent. That includes the time Căn bản sat at the docs root, as `/docs/bat-dau/...` and `/docs/cach-hoat-dong/...`.
  - The template serves the agent-facing files: `llms.txt`, `llms-full.txt`, and each page as Markdown via `.md` or `Accept: text/markdown` (handled in `proxy.ts`).
    - They're read away from the site (AI apps reached from /hoi-ai), so `absoluteLinks()` in `lib/source.ts` makes every link absolute: wiki pages point at their `.md` copies, other paths get `siteUrl`.
    - All three send `charset=utf-8` (without it, browsers can show the Vietnamese garbled).
- Search (`app/api/search/route.ts`, Fumadocs' built-in full-text engine): accent-insensitive, one result per heading or paragraph with an anchor.
  - `buildIndex` leaves out "Đọc tiếp" sections and the lesson tables on group intro pages (`index.mdx`): they repeat other pages and outranked them.
- "Hỏi AI" page (`/hoi-ai`, user's request 2026-11-09): `app/(home)/hoi-ai/page.tsx` and `components/ask/ask-ai.tsx`. It's linked as "Hỏi AI" in the home header and the wiki sidebar (`links` in `lib/layout.shared.tsx`), and listed in the sitemap.
  - Steps: (1) the reader types a question, which is kept in the URL as `?q=` so it can be shared; (2) live results from `/api/search`, grouped by page; (3) the reader picks an AI app and takes a Vietnamese prompt there. The prompt carries the question, `llms.txt` and the `.md` links of the top 3 pages.
  - **No AI runs on our side** (user: "People abusing my AI would cost me too much").
  - Each app button either opens the app with the question filled in or shows copy → open → paste steps.
    - ChatGPT and Claude take `?q=` (the links Fumadocs' page actions use).
    - Perplexity and Grok are reported to; Gemini and DeepSeek have no documented one.
    - Prefill was not click-tested: opening the links would send a question from the user's own accounts.
    - The prompt is also copied on click, in case the app opens empty.
  - The chosen app is remembered per viewer in localStorage (`eth-ask-app`).
  - Highlighting matches accents exactly when the reader typed them ("đóng" ≠ "đồng") and ignores them when they didn't.
  - On localhost a note says AI apps can't open the links. The page only works for real once `NEXT_PUBLIC_SITE_URL` is set.
  - Share image: `app/og/hoi-ai/image.png/route.tsx`.
  - A new route folder wasn't picked up by the running dev server (404) until it was restarted.
- Indexing and sharing (2026-11-08):
  - `app/sitemap.ts` and `app/robots.ts` exist.
  - The root layout sets `metadataBase`, the title template "%s | Wiki ETH.vn" and `lang="vi"`.
  - Brand (user, 2026-11-09): write "ETH.vn", never "ETHVN", in every visible text. The site is "Wiki ETH.vn" (`appName`). Repo, folder and URL slugs stay lowercase `ethvn`.
  - Social metadata (2026-11-09): every page's metadata comes from `buildMetadata()` in `lib/metadata.ts`.
    - Next replaces a page's `openGraph` / `twitter` objects instead of merging them. So the helper repeats the site name, the `vi_VN` locale and the card type, and gives the image its size and alt text.
    - Docs pages are `og:type` article, with `article:section` (the section) and tags from the Fumadocs breadcrumbs.
    - Checked on 2026-11-09 against a production build: every sitemap URL had the complete set (title, description, canonical, og:*, twitter:*, a 1200×630 PNG).
  - Share images are generated at build time with one template, `renderOgImage()` in `lib/og.tsx` (Next's `ImageResponse`):
    - Docs pages use Fumadocs' OG route (`app/og/tai-lieu/[...slug]/route.tsx`). The label comes from `pageTrail()` in `lib/sections.tsx` (Fumadocs `getBreadcrumbItems`), and its colour from the section (`SECTION_HEX`, mirroring the dark `--section-*` colours).
    - The home page uses `app/og/home/image.png/route.tsx`. A file-based `opengraph-image` in `(home)` was tried; its tags were dropped because the page's own `openGraph` replaces them.
    - The design, per the user: dark background, faint iso grid, mark + "Wiki ETH.vn", section label, title, description. No block chain and no bottom bar. Titles shrink to fit one line when they can.
    - Font: JetBrains Mono from `@fontsource/jetbrains-mono` (woff, which Satori reads). The latin and Vietnamese subsets are registered as two families ("JBM", "JBM Vietnamese") listed together; with one shared name, bold titles fell back to regular for Vietnamese letters.
    - Satori only accepts plain elements inside `<svg>`, so the cube is a function, not a component.
  - Icons: `app/icon.svg` and `app/apple-icon.tsx` draw an isometric cube. **Placeholder**: the user will supply the real logo; swap it in there and in the mark in `lib/og.tsx`.
  - Absolute URLs come from `siteUrl` in `lib/shared.ts`, read from `NEXT_PUBLIC_SITE_URL`.
    - Next bakes it in at **build** time, so it must be set when building, not only at runtime.
    - The domain isn't decided. Without it, canonical links, share images and the sitemap point at localhost; `next.config.mjs` warns during production builds.
- `bun run build` and `bun run types:check` both pass.

## Next steps (agreed direction, not done yet)

1. **Move the content in.** Done: see "Current state". Keep the folder names as they are (they are the Vietnamese slugs).
2. **Make it Vietnamese.**
   - `lang="vi"`, the name "Wiki ETH.vn" (`appName`) and the font (JetBrains Mono with the Vietnamese subset) are done.
   - Translate Fumadocs' own UI text (search box, "On this page", etc.).
   - Point `gitConfig` at the real repo.
   - Check that search handles Vietnamese with its diacritics. Checked 2026-11-09: accents are optional, and after the `buildIndex` filtering a set of ten Vietnamese questions put the expected page first or second.
3. **Theme.** Done: see "Current state".
4. **Routing.** The wiki is a subdomain, with pages at `/tai-lieu` (user's choice). The domain is still open, and `NEXT_PUBLIC_SITE_URL` depends on it.
5. **"Chat about this page" with the reader's own AI.** Avoid paid AI on our side.
   - Done: Copy Markdown and Open in ChatGPT / Claude on every page (Fumadocs page actions), and the "Hỏi AI" page (see "Current state"). The user chose redirecting to the reader's own AI over any AI on our side (2026-11-09).
   - Researched 2026-11-09, not built:
     - In-browser models (WebLLM with Qwen3) work on desktop Chrome, Edge and Safari, but are unreliable on iPhone: iOS kills the GPU process.
     - Chrome's built-in model (Gemini Nano) doesn't take Vietnamese: the user's Chrome 156 reports `vi` unavailable.
     - Safari has no web API for Apple's on-device model.
   - Treat page content as untrusted input to the model.
   - Don't use the template's `--ai-chat` options (openrouter, llmgateway, inkeep): they cost us money.
6. **Write Căn bản first** (user, 2026-11-08), then the other four sections, using ethereum.org as the reference. Done so far: Bắt đầu and Cách hoạt động. Other groups aren't decided yet; `CONTRIBUTING.md` lists the earlier ideas.

## Open questions for the user

- Domain mapping: is eth.vn the wallet or ethvn-home? Is the wiki at wiki.eth.vn?
- Licence for the wiki's own content: MIT like ethereum.org, or CC BY-SA?
- GitHub org and repo name for `gitConfig`.
