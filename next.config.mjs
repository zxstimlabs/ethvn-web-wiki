import { createMDX } from 'fumadocs-mdx/next';

const withMDX = createMDX();

// Share previews, canonical links and the sitemap need the public address.
if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_SITE_URL) {
  console.warn('⚠ NEXT_PUBLIC_SITE_URL is not set: canonical links, share images and the sitemap will point at localhost. Set it when building (Next bakes it in at build time).');
}

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  async redirects() {
    return [
      // the wiki lives at /tai-lieu, and has no page of its own: it starts at the Căn bản section
      { source: '/tai-lieu', destination: '/tai-lieu/can-ban', permanent: true },
      // keep earlier links working: the wiki used to live at /docs, with Căn bản at its root
      { source: '/docs', destination: '/tai-lieu/can-ban', permanent: true },
      { source: '/docs/bat-dau/:path*', destination: '/tai-lieu/can-ban/bat-dau/:path*', permanent: true },
      { source: '/docs/cach-hoat-dong/:path*', destination: '/tai-lieu/can-ban/cach-hoat-dong/:path*', permanent: true },
      // "Nhà nước" was renamed "Chính phủ" (user, 2026-11-09)
      { source: '/docs/nha-nuoc/:path*', destination: '/tai-lieu/chinh-phu/:path*', permanent: true },
      { source: '/tai-lieu/nha-nuoc/:path*', destination: '/tai-lieu/chinh-phu/:path*', permanent: true },
      { source: '/docs/:path*', destination: '/tai-lieu/:path*', permanent: true },
    ];
  },
};

export default withMDX(config);
