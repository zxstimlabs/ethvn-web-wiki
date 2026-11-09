import { ImageResponse } from 'next/og';

// Home-screen icon (iOS): the wiki's block on the dark background.
export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0b0b0c' }}>
        <svg width="120" height="120" viewBox="0 0 32 32">
          <polygon points="3.6,9.5 16,16.5 16,30 3.6,23" fill="#5b3fc4" stroke="#a78bfa" strokeWidth={1.2} strokeLinejoin="round" />
          <polygon points="16,16.5 28.4,9.5 28.4,23 16,30" fill="#3b2a85" stroke="#a78bfa" strokeWidth={1.2} strokeLinejoin="round" />
          <polygon points="16,2.5 28.4,9.5 16,16.5 3.6,9.5" fill="#a78bfa" stroke="#a78bfa" strokeWidth={1.2} strokeLinejoin="round" />
        </svg>
      </div>
    ),
    size,
  );
}
