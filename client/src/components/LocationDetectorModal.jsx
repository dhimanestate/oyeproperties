import React from 'react';
import { MapPin, Navigation, Check, X, Compass } from 'lucide-react';

export default function LocationDetectorModal({
  isOpen,
  onClose,
  currentCity,
  onSelectCity,
  detectedLocation,
  onDetectGPS,
  isDetectingGPS
}) {
  if (!isOpen) return null;

  const CITIES = [
    {
      name: 'All Cities',
      subtitle: 'Global Ultra-Luxury Catalogue',
      count: '16 Properties',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Mumbai',
      subtitle: 'Worli Sea Face, Bandra & Juhu',
      count: '5 Properties',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Delhi NCR',
      subtitle: 'Golf Course Rd, Gurgaon & South Delhi',
      count: '3 Properties',
      image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Dubai',
      subtitle: 'Palm Jumeirah & Downtown Burj',
      count: '2 Properties',
      image: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Goa',
      subtitle: 'Candolim Cliff & Assagao Heritage',
      count: '2 Properties',
      image: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Bangalore',
      subtitle: 'Prestige Golfshire & Whitefield',
      count: '2 Properties',
      image: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Hyderabad',
      subtitle: 'Jubilee Hills & Banjara Hills',
      count: '2 Properties',
      image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'Faridabad',
      subtitle: 'Sectors 1-144, Neharpar & Surajkund',
      count: 'Prime NCR Hub',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=400&q=80'
    },
    {
      name: 'London',
      subtitle: 'Knightsbridge & Hyde Park',
      count: '1 Property',
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=400&q=80'
    }
  ];

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div 
        className="modal-box"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: '680px',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '28px',
          position: 'relative',
          background: '#ffffff',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #E71D2B 0%, #C41523 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)'
            }}>
              <Compass size={20} color="#ffffff" />
            </div>
            <div>
              <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-primary)' }}>Select Prime Real Estate Market</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                Real-time GPS detection matches you with localized reels & private listings
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* GPS Live Detection Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #FFF0F1 0%, #FFE4E6 100%)',
          border: '1px solid rgba(231, 29, 43, 0.2)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: 'var(--accent-emerald)'
            }} className="live-pulse" />
            <div>
              <div style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                {detectedLocation?.mode === 'gps' ? 'Live GPS Location Locked' : 'Auto Location Detector'}
              </div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                {detectedLocation?.city || 'Mumbai'}, {detectedLocation?.locality || 'Worli Sea Face'}
              </div>
            </div>
          </div>

          <button
            id="btn-detect-gps"
            onClick={onDetectGPS}
            disabled={isDetectingGPS}
            className="btn-primary"
            style={{
              fontSize: '12px',
              padding: '8px 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Navigation size={13} className={isDetectingGPS ? 'animate-spin' : ''} />
            {isDetectingGPS ? 'Detecting...' : 'Detect My City'}
          </button>
        </div>

        {/* City Grid Selection */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '12px'
        }}>
          {CITIES.map(city => {
            const isSelected = (currentCity === city.name) || (currentCity === 'all' && city.name === 'All Cities');
            return (
              <div
                key={city.name}
                id={`city-option-${city.name.toLowerCase().replace(/\s+/g, '-')}`}
                onClick={() => {
                  onSelectCity(city.name === 'All Cities' ? 'all' : city.name);
                  onClose();
                }}
                style={{
                  background: isSelected ? '#FFF0F1' : '#f8fafc',
                  border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.background = '#ffffff';
                  }
                }}
                onMouseLeave={e => {
                  if (!isSelected) {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.background = '#f8fafc';
                  }
                }}
              >
                <img
                  src={city.image}
                  alt={city.name}
                  style={{
                    width: '52px',
                    height: '52px',
                    borderRadius: '10px',
                    objectFit: 'cover'
                  }}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 800, fontSize: '14px', color: 'var(--text-primary)' }}>{city.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontWeight: 700 }}>{city.count}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {city.subtitle}
                  </div>
                </div>

                {isSelected && (
                  <div style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'var(--accent-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <Check size={14} color="#ffffff" strokeWidth={3} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
