import React, { useState } from 'react';
import { Layers, X, PhoneCall } from 'lucide-react';

export default function CompareDrawer({
  comparedProperties,
  onRemove,
  onClear,
  onOpenCallback,
  onOpenDetail
}) {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (comparedProperties.length === 0) return null;

  return (
    <>
      {/* Floating Bottom Bar — sits above mobile nav (64px) */}
      <div style={{
        position: 'fixed',
        bottom: isMobile ? 'max(74px, env(safe-area-inset-bottom, 74px))' : 'max(80px, env(safe-area-inset-bottom, 80px))',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#ffffff',
        border: '1.5px solid #E71D2B',
        borderRadius: 'var(--radius-full)',
        padding: isMobile ? '6px 12px' : '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: isMobile ? '8px' : '12px',
        zIndex: 40,
        boxShadow: '0 8px 30px rgba(231, 29, 43, 0.18)',
        animation: 'floatUp 0.3s ease-out',
        maxWidth: 'calc(100vw - 20px)',
        width: 'max-content'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={isMobile ? 15 : 18} color="var(--accent-primary)" />
          <span style={{ fontSize: isMobile ? '12px' : '13px', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            Compare ({comparedProperties.length}/3)
          </span>
        </div>

        {/* Mini Thumbnails */}
        <div style={{ display: 'flex', gap: '5px' }}>
          {comparedProperties.map(p => (
            <div key={p.id} style={{ position: 'relative' }}>
              <img
                src={p.images[0]}
                alt={p.title}
                style={{ width: isMobile ? '28px' : '32px', height: isMobile ? '28px' : '32px', borderRadius: '6px', objectFit: 'cover' }}
              />
              <button
                onClick={() => onRemove(p.id)}
                style={{
                  position: 'absolute',
                  top: '-4px',
                  right: '-4px',
                  background: '#f43f5e',
                  border: 'none',
                  borderRadius: '50%',
                  width: '14px',
                  height: '14px',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                title="Remove"
              >
                <X size={9} />
              </button>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            id="btn-open-compare-modal"
            onClick={() => setIsOpenModal(true)}
            className="btn-primary"
            style={{ fontSize: isMobile ? '11px' : '12px', padding: isMobile ? '6px 12px' : '6px 14px', whiteSpace: 'nowrap' }}
          >
            Compare Specs
          </button>

          <button
            onClick={onClear}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: isMobile ? '11px' : '12px',
              cursor: 'pointer',
              fontWeight: 600,
              padding: '4px'
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Modal */}
      {isOpenModal && (
        <div className="modal-backdrop" onClick={() => setIsOpenModal(false)} style={{ zIndex: 100000 }}>
          <div
            className="modal-box"
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '960px',
              maxHeight: isMobile ? '92vh' : '90vh',
              overflowY: 'auto',
              padding: isMobile ? '16px 12px 24px' : '28px',
              position: 'relative',
              background: '#ffffff',
              borderRadius: isMobile ? '20px 20px 0 0' : '16px',
              boxShadow: '0 25px 60px rgba(0,0,0,0.25)'
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: isMobile ? '14px' : '20px',
              borderBottom: '1px solid var(--border-subtle)',
              paddingBottom: '12px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: isMobile ? '32px' : '38px',
                  height: isMobile ? '32px' : '38px',
                  borderRadius: '10px',
                  background: '#FFF0F1',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}>
                  <Layers size={isMobile ? 18 : 22} color="#E71D2B" />
                </div>
                <div>
                  <h3 style={{ fontSize: isMobile ? '16px' : '20px', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                    Side-by-Side Comparison
                  </h3>
                  {isMobile && (
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      ← Swipe horizontally to view all specs →
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setIsOpenModal(false)}
                style={{
                  background: 'var(--bg-secondary)',
                  border: 'none',
                  color: 'var(--text-muted)',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Horizontally Scrollable Comparison Container on Mobile */}
            <div style={{
              overflowX: 'auto',
              WebkitOverflowScrolling: 'touch',
              paddingBottom: '10px'
            }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile 
                  ? `120px repeat(${comparedProperties.length}, minmax(180px, 1fr))` 
                  : `160px repeat(${comparedProperties.length}, 1fr)`,
                minWidth: isMobile ? `${120 + comparedProperties.length * 190}px` : 'auto',
                gap: isMobile ? '8px' : '14px',
                alignItems: 'stretch'
              }}>
                {/* Column 1: Header / Estate Overview */}
                <div style={{
                  fontWeight: 700,
                  color: 'var(--text-muted)',
                  fontSize: isMobile ? '11px' : '12px',
                  alignSelf: 'end',
                  paddingBottom: '12px'
                }}>
                  Estate Overview
                </div>
                {comparedProperties.map(p => (
                  <div key={p.id} style={{
                    background: '#FAFAFA',
                    border: '1.5px solid var(--border-subtle)',
                    borderRadius: '12px',
                    padding: isMobile ? '10px' : '14px',
                    textAlign: 'center',
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between'
                  }}>
                    <div>
                      <div style={{ position: 'relative', width: '100%', height: isMobile ? '100px' : '130px', borderRadius: '8px', overflow: 'hidden', marginBottom: '8px' }}>
                        <img
                          src={p.images[0]}
                          alt={p.title}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                        <button
                          onClick={() => onRemove(p.id)}
                          style={{
                            position: 'absolute',
                            top: '6px',
                            right: '6px',
                            background: 'rgba(0,0,0,0.6)',
                            border: 'none',
                            color: '#fff',
                            width: '20px',
                            height: '20px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer'
                          }}
                          title="Remove from compare"
                        >
                          <X size={12} />
                        </button>
                      </div>
                      <div style={{
                        fontSize: isMobile ? '12.5px' : '14px',
                        fontWeight: 800,
                        color: 'var(--text-primary)',
                        marginBottom: '3px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        lineHeight: 1.25
                      }}>
                        {p.title}
                      </div>
                      <div style={{ fontSize: isMobile ? '10.5px' : '11.5px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                        {p.location.locality}, {p.location.city}
                      </div>
                    </div>
                    <div style={{
                      fontSize: isMobile ? '15px' : '18px',
                      fontWeight: 800,
                      color: 'var(--accent-primary)',
                      fontFamily: 'var(--font-display)'
                    }}>
                      {p.priceFormatted}
                    </div>
                  </div>
                ))}

                {/* Price / sq.ft */}
                <div style={{ fontSize: isMobile ? '11px' : '12.5px', color: 'var(--text-muted)', fontWeight: 600, borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  Rate per Sq.Ft
                </div>
                {comparedProperties.map(p => (
                  <div key={p.id} style={{ fontSize: isMobile ? '11.5px' : '13px', fontWeight: 700, color: 'var(--text-primary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    {p.pricePerSqFt}
                  </div>
                ))}

                {/* Configuration */}
                <div style={{ fontSize: isMobile ? '11px' : '12.5px', color: 'var(--text-muted)', fontWeight: 600, borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  Bedrooms & Baths
                </div>
                {comparedProperties.map(p => (
                  <div key={p.id} style={{ fontSize: isMobile ? '11.5px' : '13px', fontWeight: 700, color: 'var(--text-primary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    {p.bhk ? `${p.bhk} BHK` : p.propertyType} • {p.baths || 3} Baths
                  </div>
                ))}

                {/* Total Area */}
                <div style={{ fontSize: isMobile ? '11px' : '12.5px', color: 'var(--text-muted)', fontWeight: 600, borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  Area
                </div>
                {comparedProperties.map(p => (
                  <div key={p.id} style={{ fontSize: isMobile ? '11.5px' : '13px', fontWeight: 700, color: 'var(--text-primary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    {p.areaSqFt ? `${p.areaSqFt.toLocaleString()} ${p.areaUnit || 'Sq. Ft.'}` : `${p.carpetAreaSqFt || '—'} sq.ft`}
                  </div>
                ))}

                {/* Floor */}
                <div style={{ fontSize: isMobile ? '11px' : '12.5px', color: 'var(--text-muted)', fontWeight: 600, borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  Floor Level
                </div>
                {comparedProperties.map(p => (
                  <div key={p.id} style={{ fontSize: isMobile ? '11.5px' : '13px', fontWeight: 700, color: 'var(--text-primary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    🏢 {p.floor || 'Standard Level'}
                  </div>
                ))}

                {/* Property Type */}
                <div style={{ fontSize: isMobile ? '11px' : '12.5px', color: 'var(--text-muted)', fontWeight: 600, borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  Property Type
                </div>
                {comparedProperties.map(p => (
                  <div key={p.id} style={{ fontSize: isMobile ? '11.5px' : '13px', fontWeight: 700, color: '#E71D2B', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    {p.propertyType}
                  </div>
                ))}

                {/* Possession */}
                <div style={{ fontSize: isMobile ? '11px' : '12.5px', color: 'var(--text-muted)', fontWeight: 600, borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  Possession
                </div>
                {comparedProperties.map(p => (
                  <div key={p.id} style={{ fontSize: isMobile ? '11.5px' : '13px', fontWeight: 700, color: '#16a34a', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    {p.buyingDetails?.possessionDate || p.possession || p.status || 'Ready to Move'}
                  </div>
                ))}

                {/* Rental Yield */}
                <div style={{ fontSize: isMobile ? '11px' : '12.5px', color: 'var(--text-muted)', fontWeight: 600, borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  Rental Yield
                </div>
                {comparedProperties.map(p => (
                  <div key={p.id} style={{ fontSize: isMobile ? '11.5px' : '13px', fontWeight: 800, color: '#059669', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                    {p.financials?.grossRentalYield || '5.2% p.a.'}
                  </div>
                ))}

                {/* Actions */}
                <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }} />
                {comparedProperties.map(p => (
                  <div key={p.id} style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <button
                      onClick={() => {
                        setIsOpenModal(false);
                        onOpenDetail(p);
                      }}
                      className="btn-secondary"
                      style={{ fontSize: isMobile ? '11px' : '12px', justifyContent: 'center', padding: isMobile ? '7px 8px' : '8px 12px' }}
                    >
                      Know More
                    </button>

                    <button
                      onClick={() => {
                        setIsOpenModal(false);
                        onOpenCallback(p);
                      }}
                      className="btn-primary"
                      style={{ fontSize: isMobile ? '11px' : '12px', justifyContent: 'center', padding: isMobile ? '7px 8px' : '8px 12px', gap: '5px' }}
                    >
                      <PhoneCall size={isMobile ? 12 : 13} />
                      Call Back
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
