import { source } from '@/lib/source';
import { createFromSource } from 'fumadocs-core/search/server';

/**
 * Text left out of the search index, because it only repeats other pages and
 * then outranks them:
 * - link lists: "Đọc tiếp", "Nguồn" (sources) and "Đọc theo thứ tự" (the
 *   reading order on a section's front page). "Phí gas" in a "Đọc tiếp"
 *   list beat the Phí gas page;
 * - the tables on group intro pages (`index.mdx`), which list every lesson
 *   with its description ("token là gì" beat the Token page).
 */
const SKIP_SECTIONS = new Set(['đọc-tiếp', 'nguồn', 'đọc-theo-thứ-tự']);
const isTable = (text: string) => text.trimStart().startsWith('|');

export const { GET } = createFromSource(source, {
  buildIndex(page) {
    const data = page.data.structuredData;
    const isIntro = page.path.endsWith('index.mdx');
    return {
      id: page.url,
      url: page.url,
      title: page.data.title,
      description: page.data.description,
      structuredData: {
        ...data,
        headings: data.headings.filter((h) => !SKIP_SECTIONS.has(h.id)),
        contents: data.contents.filter(
          (c) => !(c.heading && SKIP_SECTIONS.has(c.heading)) && !(isIntro && isTable(c.content)),
        ),
      },
    };
  },
});
