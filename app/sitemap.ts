import type { MetadataRoute } from 'next';
import { source } from '@/lib/source';
import { askRoute, siteUrl } from '@/lib/shared';

/** Every wiki page plus the home and Hỏi AI pages, for search engines. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${siteUrl}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${siteUrl}${askRoute}`, changeFrequency: 'monthly', priority: 0.8 },
    ...source.getPages().map((page) => ({
      url: `${siteUrl}${page.url}`,
      changeFrequency: 'weekly' as const,
      // section front pages first
      priority: page.slugs.length <= 1 ? 0.9 : 0.7,
    })),
  ];
}
