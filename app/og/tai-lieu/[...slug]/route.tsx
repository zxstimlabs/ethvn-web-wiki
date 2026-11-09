import { source } from '@/lib/source';
import { notFound } from 'next/navigation';
import { renderOgImage } from '@/lib/og';
import { pageTrail } from '@/lib/sections';
import { getPageImageUrl } from '@/lib/shared';

export const revalidate = false;

/**
 * The share image of every wiki page, generated at build time from the
 * Fumadocs source: the label comes from the page tree's breadcrumbs, the
 * accent from the page's section.
 */
export async function GET(_req: Request, { params }: RouteContext<'/og/tai-lieu/[...slug]'>) {
  const { slug } = await params;
  const page = source.getPage(slug.slice(0, -1));
  if (!page) notFound();

  const { trail, color } = pageTrail(page);
  // a section's front page is titled with the section's name: label it as part of the wiki instead
  const eyebrow = trail.length === 1 && trail[0] === page.data.title ? 'Tài liệu' : trail.join(' · ');
  return renderOgImage({ eyebrow, title: page.data.title, description: page.data.description, color });
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    lang: page.locale,
    slug: getPageImageUrl(page).segments,
  }));
}
