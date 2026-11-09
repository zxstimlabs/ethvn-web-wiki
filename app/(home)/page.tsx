import type { Metadata } from 'next';
import { Hero } from '@/components/hero/hero';
import { buildMetadata } from '@/lib/metadata';
import { homeDescription, homeTitle } from '@/lib/shared';

export const metadata: Metadata = {
  ...buildMetadata({ title: homeTitle, description: homeDescription, path: '/', image: '/og/home/image.png' }),
  title: { absolute: homeTitle },
};

export default function HomePage() {
  return (
    <section lang="vi" className="mx-auto w-full max-w-[1200px] px-4 pt-6 pb-20 md:pt-10">
      {/* No visible title: the animation carries the idea. The h1 stays for screen readers and search engines. */}
      <h1 className="sr-only">Wiki ETH.vn: một khối Ethereum ra đời và được nối vào chuỗi như thế nào</h1>
      <Hero />
    </section>
  );
}
