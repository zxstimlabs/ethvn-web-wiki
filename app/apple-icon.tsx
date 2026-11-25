import { ImageResponse } from 'next/og';
import { LOGO_MARK, LOGO_VIEWBOX } from '@/lib/logo';

// Home-screen icon (iOS): the ETH.vn symbol. The tile is full-bleed because iOS rounds the corners itself.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', backgroundColor: '#000' }}>
        <svg width="180" height="180" viewBox={LOGO_VIEWBOX}>
          <path d={LOGO_MARK} fill="#fff" fillRule="evenodd" />
        </svg>
      </div>
    ),
    size,
  );
}
