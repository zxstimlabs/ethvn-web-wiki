import { Card, Cards } from 'fumadocs-ui/components/card';
import { getSections, sectionStyle } from '@/lib/sections';

/**
 * The wiki's sections as cards, from their meta.json (title, description,
 * icon), so they always match the sidebar dropdown. On phones this is the
 * easiest way to see every section at once.
 *
 * `links` overrides where a section's card goes, by folder name, e.g. to skip
 * the intro page the reader is already on: `links={{ 'can-ban': '/tai-lieu/can-ban/bat-dau' }}`.
 */
export function SectionCards({ links = {} }: { links?: Record<string, string> }) {
  return (
    <Cards>
      {getSections().map((s) => (
        <Card
          key={s.key}
          href={links[s.key] ?? s.url}
          title={s.title}
          description={s.description}
          icon={
            <span className="text-(--section)" style={sectionStyle(s.key)}>
              {s.icon}
            </span>
          }
        />
      ))}
    </Cards>
  );
}
