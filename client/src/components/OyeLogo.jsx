import React from 'react';

export default function OyeLogo({ isMobile = false }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', userSelect: 'none', flexShrink: 0, height: '100%' }}>
      <img
        src="/oye-logo.jpg"
        alt="Oye Properties"
        className="oye-brand-logo-img"
        style={{
          height: isMobile ? '60px' : '90px',
          maxHeight: isMobile ? '60px' : '90px',
          width: 'auto',
          maxWidth: '240px',
          objectFit: 'contain',
          display: 'block',
          flexShrink: 0,
        }}
        draggable={false}
      />
    </div>
  );
}


