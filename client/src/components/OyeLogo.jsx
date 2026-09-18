import React from 'react';

export default function OyeLogo({ isMobile = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', userSelect: 'none', flexShrink: 0 }}>
      {/* House / Roof SVG Emblem */}
      <svg
        width={isMobile ? '30' : '34'}
        height={isMobile ? '30' : '34'}
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        {/* Roof */}
        <path
          d="M6 26L28 6L50 26"
          stroke="#E71D2B"
          strokeWidth="4.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* House body */}
        <rect x="12" y="26" width="32" height="22" rx="3" fill="#E71D2B" />
        {/* Door */}
        <rect x="22" y="36" width="12" height="12" rx="2" fill="#ffffff" />
        {/* Door knob */}
        <circle cx="31" cy="42.5" r="1.2" fill="#E71D2B" />
      </svg>

      {/* Wordmark */}
      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', lineHeight: 1 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '2px' }}>
          <span style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: isMobile ? '16px' : '19px',
            fontWeight: 800,
            color: '#E71D2B',
            letterSpacing: '-0.02em',
            whiteSpace: 'nowrap',
          }}>
            Oye
          </span>
          <span style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: isMobile ? '16px' : '19px',
            fontWeight: 600,
            color: '#1F1F1F',
            letterSpacing: '-0.01em',
            whiteSpace: 'nowrap',
          }}>
            Properties
          </span>
        </div>
        {/* Tagline — desktop only */}
        {!isMobile && (
          <div style={{
            fontFamily: "'Poppins', sans-serif",
            fontSize: '8px',
            fontWeight: 500,
            color: '#999999',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            marginTop: '2px',
            whiteSpace: 'nowrap',
          }}>
            Find · Visit · Move In
          </div>
        )}
      </div>
    </div>
  );
}
