import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { HomeLayout } from 'fumadocs-ui/layouts/home';
import { buttonVariants } from '@/components/ui/button';
import { baseOptions } from '@/lib/layout.shared';
import { cn } from '@/lib/cn';
import { docsHome } from '@/lib/shared';

export default function Layout({ children }: LayoutProps<'/'>) {
  const base = baseOptions();
  return (
    <HomeLayout
      {...base}
      nav={{
        ...base.nav,
        // `order-last` puts it in the header's right corner at every width:
        // after GitHub on desktop, after search and the menu toggle on mobile.
        children: (
          <Link href={docsHome} className={cn(buttonVariants(), 'order-last ms-2')}>
            Đọc wiki
            <ArrowRight data-icon="inline-end" />
          </Link>
        ),
      }}
    >
      {children}
    </HomeLayout>
  );
}
