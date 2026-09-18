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

  if (comparedProperties.length === 0) return null;

  return (
    <>
      {/* Floating Bottom Bar — sits above mobile nav (64px) */}
      <div style={{
        position: 'fixed',
        bottom: 'max(80px, env(safe-area-inset-bottom, 80px))',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#ffffff',
        border: '1px solid rgba(11, 28, 61, 0.2)',
        borderRadius: 'var(--radius-full)',
        padding: '8px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        zIndex: 40,
        boxShadow: 'var(--shadow-lg)',
        animation: 'floatUp 0.3s ease-out',
        maxWidth: 'calc(100vw - 24px)',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Layers size={18} color="var(--accent-primary)" />
          <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
            Compare ({comparedProperties.length}/3)
          </span>
        </div>

        {/* Mini Thumbnails */}
        <div style={{ display: 'flex', gap: '6px' }}>
          {comparedProperties.map(p => (
            <div key={p.id} style={{ position: 'relative' }}>
              <img
                src={p.images[0]}
                alt={p.title}
                style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }}
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
              >
                <X size={10} />
              </button>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            id="btn-open-compare-modal"
            onClick={() => setIsOpenModal(true)}
            className="btn-primary"
            style={{ fontSize: '12px', padding: '6px 14px' }}
          >
            Compare Side-by-Side
          </button>

          <button
            onClick={onClear}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              fontSize: '12px',
              cursor: 'pointer',
              fontWeight: 600
            }}
          >
            Clear
          </button>
        </div>
      </div>

      {/* Side-by-Side Comparison Modal */}
      {isOpenModal && (
        <div className="modal-backdrop" onClick={() => setIsOpenModal(false)}>
          <div
            className="glass-panel-heavy"
            onClick={e => e.stopPropagation()}
            style={{
              width: '100%',
              maxWidth: '960px',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: '28px',
              position: 'relative',
              background: '#ffffff'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Layers size={22} color="var(--accent-primary)" />
                <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Side-by-Side Property Comparison
                </h3>
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
                  justifyContent: 'center'
                }}
              >
                <X size={16} />
              </button>
            </div>

            {/* Comparison Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: `180px repeat(${comparedProperties.length}, 1fr)`,
              gap: '14px',
              alignItems: 'stretch'
            }}>
              <div style={{ fontWeight: 700, color: 'var(--text-muted)', fontSize: '12px', alignSelf: 'end', paddingBottom: '12px' }}>
                Estate Overview
              </div>
              {comparedProperties.map(p => (
                <div key={p.id} style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  textAlign: 'center'
                }}>
                  <img
                    src={p.images[0]}
                    alt={p.title}
                    style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', marginBottom: '8px' }}
                  />
                  <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
                    {p.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    {p.location.locality}, {p.location.city}
                  </div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-primary)' }}>
                    {p.priceFormatted}
                  </div>
                </div>
              ))}

              {/* Price / sq.ft */}
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                Rate per Sq.Ft
              </div>
              {comparedProperties.map(p => (
                <div key={p.id} style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  {p.pricePerSqFt}
                </div>
              ))}

              {/* Configuration */}
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                Bedrooms & Baths
              </div>
              {comparedProperties.map(p => (
                <div key={p.id} style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  {p.bhk} BHK • {p.baths} Baths
                </div>
              ))}

              {/* Carpet Area */}
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                Carpet Area
              </div>
              {comparedProperties.map(p => (
                <div key={p.id} style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  {p.carpetAreaSqFt} sq.ft
                </div>
              ))}

              {/* Property Type */}
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                Category
              </div>
              {comparedProperties.map(p => (
                <div key={p.id} style={{ fontSize: '13px', fontWeight: 700, color: '#E71D2B', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  {p.propertyType}
                </div>
              ))}

              {/* Rental Yield */}
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                Gross Rental Yield
              </div>
              {comparedProperties.map(p => (
                <div key={p.id} style={{ fontSize: '13px', fontWeight: 800, color: 'var(--accent-emerald)', borderTop: '1px solid var(--border-subtle)', paddingTop: '10px' }}>
                  {p.financials.grossRentalYield}
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
                    style={{ fontSize: '12px', justifyContent: 'center' }}
                  >
                    Know More
                  </button>

                  <button
                    onClick={() => {
                      setIsOpenModal(false);
                      onOpenCallback(p);
                    }}
                    className="btn-primary"
                    style={{ fontSize: '12px', justifyContent: 'center' }}
                  >
                    <PhoneCall size={13} />
                    Get Call Back
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
