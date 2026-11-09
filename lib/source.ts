import { llms, loader } from 'fumadocs-core/source';
import { lucideIconsPlugin } from 'fumadocs-core/source/lucide-icons';
import { docsRoute, siteUrl } from './shared';
import { defineDocs } from 'fumadocs-mdx/macro';
import { metaSchema, pageSchema } from 'fumadocs-core/source/schema';

const docs = defineDocs({
  dir: 'content/docs',
  docs: {
    schema: pageSchema,
    postprocess: {
      includeProcessedMarkdown: true,
    },
  },
  meta: {
    schema: metaSchema,
  },
});

// See https://fumadocs.dev/docs/headless/source-api for more info
export const source = loader({
  baseUrl: docsRoute,
  source: docs.toFumadocsSource(),
  plugins: [lucideIconsPlugin()],
});

/** Absolute URL of a page's Markdown copy (`/tai-lieu/x` → `https://…/tai-lieu/x.md`). */
export const markdownUrl = (url: string) => `${siteUrl}${url}.md`;

/**
 * The Markdown served to AI tools (llms.txt, llms-full.txt, `.md` pages) is
 * read away from the site, often by an AI app the reader sent there from
 * /hoi-ai, so every link in it is made absolute. Links to wiki pages (written
 * `./x.mdx` in the source, or `/tai-lieu/…`) point at the pages' Markdown
 * copies; other paths on the site just get the domain.
 */
export function absoluteLinks(markdown: string, dir = '') {
  return markdown.replace(/\]\(([^)\s]+)\)/g, (match, href: string) => {
    if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('#')) return match;
    const [path, hash] = href.split('#', 2);
    const anchor = hash ? `#${hash}` : '';
    if (/\.mdx?$/.test(path)) {
      const found = source.getPageByHref(path, { dir });
      return found ? `](${markdownUrl(found.page.url)}${anchor})` : match;
    }
    if (!path.startsWith('/')) return match;
    if (path === docsRoute || path.startsWith(`${docsRoute}/`)) {
      const page = source.getPage(path.slice(docsRoute.length).split('/').filter(Boolean));
      if (page) return `](${markdownUrl(page.url)}${anchor})`;
    }
    return `](${siteUrl}${href})`;
  });
}

export const docsLlms = llms(source, {
  renderPage: async (page) => `# ${page.data.title} (${siteUrl}${page.url})

${absoluteLinks(await page.data.getText('processed'), page.path.split('/').slice(0, -1).join('/'))}`,
});

/** llms.txt: every page with its description, linking to the Markdown copies. */
export async function llmsIndex() {
  return absoluteLinks(await docsLlms.index());
}
