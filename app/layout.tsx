import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { JetBrains_Mono } from 'next/font/google';
import type { Metadata } from 'next';
import { cn } from '@/lib/cn';
import { appDescription, appName, siteUrl } from '@/lib/shared';

// One font for everything (body, headings, code), with Vietnamese glyphs.
// global.css maps font-sans and font-heading to it as well.
const font = JetBrains_Mono({
  subsets: ['latin', 'vietnamese'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: appName, template: `%s | ${appName}` },
  description: appDescription,
  applicationName: appName,
  openGraph: { siteName: appName, locale: 'vi_VN', type: 'website' },
  twitter: { card: 'summary_large_image' },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="vi" className={cn('antialiased', font.variable)} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
