import { renderOgImage } from '@/lib/og';
import { askDescription, askTitle } from '@/lib/shared';

export const revalidate = false;

/** Share image of /hoi-ai. */
export function GET() {
  return renderOgImage({
    eyebrow: 'Hỏi AI',
    title: askTitle,
    description: askDescription,
    color: '#34d399',
  });
}
