import { ImageResponse } from 'next/og';

// Image metadata
export const alt = 'Daily Ticker — Plain-English Market Briefs';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

// Image generation
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#0B1E32',
          backgroundImage: 'radial-gradient(circle at 25px 25px, #1a3a52 2%, transparent 0%), radial-gradient(circle at 75px 75px, #1a3a52 2%, transparent 0%)',
          backgroundSize: '100px 100px',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 30,
          }}
        >
          {/* Logo */}
          <div
            style={{
              width: 120,
              height: 120,
              backgroundColor: '#00FF88',
              borderRadius: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 48,
              fontWeight: 'bold',
              color: '#0B1E32',
            }}
          >
            DT
          </div>

          {/* Title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              color: 'white',
              textAlign: 'center',
              maxWidth: 900,
            }}
          >
            Daily Ticker
          </div>

          {/* Subtitle */}
          <div
            style={{
              fontSize: 36,
              color: '#00FF88',
              textAlign: 'center',
              maxWidth: 800,
            }}
          >
            Plain-English Market Briefs for Busy Investors
          </div>

          {/* Ticker symbols */}
          <div
            style={{
              display: 'flex',
              gap: 40,
              marginTop: 40,
              fontFamily: 'monospace',
            }}
          >
            <div style={{ color: '#00FF88', fontSize: 24 }}>
              AAPL ↑ +2.34%
            </div>
            <div style={{ color: '#FF3366', fontSize: 24 }}>
              NVDA ↓ -0.64%
            </div>
            <div style={{ color: '#00FF88', fontSize: 24 }}>
              MSFT ↑ +1.23%
            </div>
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
