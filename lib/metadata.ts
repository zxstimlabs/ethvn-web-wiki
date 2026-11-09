import type { Metadata } from 'next';
import { OG_SIZE } from './og';
import { appName } from './shared';

/**
 * Complete social metadata for one page. Next replaces (doesn't merge) the
 * `openGraph` and `twitter` objects a page returns, so site-wide fields
 * (site name, locale, card type) are repeated here for every page, and the
 * image always carries its size and alt text.
 */
export function buildMetadata({
  title,
  description,
  path,
  image,
  type = 'website',
  section,
  tags,
}: {
  title: string;
  description?: string;
  /** canonical path, e.g. /tai-lieu/can-ban */
  path: string;
  /** share image path (a route under /og) */
  image?: string;
  type?: 'website' | 'article';
  section?: string;
  tags?: string[];
}): Metadata {
  const images = image ? [{ url: image, ...OG_SIZE, alt: title, type: 'image/png' }] : undefined;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: appName,
      locale: 'vi_VN',
      images,
      ...(type === 'article' ? { type: 'article', section, tags } : { type: 'website' }),
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: images?.map(({ url, alt }) => ({ url, alt })),
    },
  };
}
