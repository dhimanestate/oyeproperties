import React from 'react';

export default function OyeLogo({ isMobile = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', userSelect: 'none', flexShrink: 0 }}>
      <img
        src="/oye-logo.jpg"
        alt="Oye Properties"
        style={{
          height: isMobile ? '80px' : '90px',
          width: 'auto',
          objectFit: 'contain',
          display: 'block',
        }}
        draggable={false}
      />
    </div>
  );
}
