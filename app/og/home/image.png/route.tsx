import { renderOgImage } from '@/lib/og';
import { homeDescription } from '@/lib/shared';

export const revalidate = false;

/** Share image of the home page, at a stable URL next to the docs pages' (/og/tai-lieu/…). */
export function GET() {
  return renderOgImage({
    eyebrow: 'Bách khoa toàn thư mở',
    title: 'Hiểu Ethereum bằng tiếng Việt',
    description: homeDescription,
    color: '#a78bfa',
  });
}
