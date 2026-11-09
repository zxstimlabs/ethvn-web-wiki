import { createGetUrl } from 'fumadocs-core/source';

export const appName = 'Wiki ETH.vn';
export const appDescription = 'Bách khoa toàn thư mở về Ethereum, viết bằng tiếng Việt.';
export const homeTitle = 'Wiki ETH.vn: hiểu Ethereum bằng tiếng Việt';
export const homeDescription =
  'Bách khoa toàn thư mở về Ethereum bằng tiếng Việt. Từ ví đầu tiên tới chuỗi khối, đồng thuận, hợp đồng thông minh và Layer 2, giải thích dễ hiểu, kèm hình động minh họa.';
/**
 * Public address of the site, for canonical links, the sitemap and share
 * previews (Open Graph images need absolute URLs). Set NEXT_PUBLIC_SITE_URL
 * when deploying; the domain isn't decided yet.
 */
export const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3123').replace(/\/$/, '');
export const docsRoute = '/tai-lieu';
/** Where "Đọc wiki" and /tai-lieu lead: the Căn bản section. */
export const docsHome = '/tai-lieu/can-ban';
export const docsImageRoute = '/og/tai-lieu';
/**
 * "Hỏi AI": search the wiki, then take the question to the reader's own AI app.
 * No AI runs on our side (user, 2026-11-09: "people abusing my AI would cost me too much").
 */
export const askRoute = '/hoi-ai';
export const askTitle = 'Hỏi AI về Ethereum';
export const askDescription =
  'Gõ câu hỏi về Ethereum: wiki tìm ngay các bài liên quan, rồi chuyển câu hỏi sang ChatGPT, Gemini, Claude hay ứng dụng AI bạn quen dùng, kèm đường dẫn để AI đọc wiki trước khi trả lời.';
export const docsContentRoute = '/llms.mdx/tai-lieu';

// fill this with your actual GitHub info, for example:
export const gitConfig = {
  user: 'fuma-nama',
  repo: 'fumadocs',
  branch: 'main',
};

const getContentUrl = createGetUrl(docsContentRoute);

export function getPageMarkdownUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'content.md'];

  return { segments, url: getContentUrl(segments, page.locale) };
}

const getImageUrl = createGetUrl(docsImageRoute);

export function getPageImageUrl(page: { slugs: string[]; locale?: string }) {
  const segments = [...page.slugs, 'image.png'];

  return { segments, url: getImageUrl(segments, page.locale) };
}
