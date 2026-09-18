import React, { useState } from 'react';
import { Heart, X, Trash2, PhoneCall, Share2, Check, MessageSquare } from 'lucide-react';

export default function WishlistDrawer({
  isOpen,
  onClose,
  wishlist,
  onRemoveItem,
  onClearWishlist,
  onOpenDetail,
  onOpenCallback
}) {
  if (!isOpen) return null;

  const [copiedLink, setCopiedLink] = useState(false);

  const totalValue = wishlist.reduce((acc, curr) => acc + (curr.price || 0), 0);
  const totalFormatted = totalValue >= 100000000
    ? `₹${(totalValue / 10000000).toFixed(1)} Cr`
    : `₹${(totalValue / 100000).toFixed(1)} Lacs`;

  const handleShareWishlist = () => {
    const ids = wishlist.map(w => w.id).join(',');
    const url = `${window.location.origin}?wishlist=${ids}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleShareWhatsApp = () => {
    const listNames = wishlist.map(w => `• ${w.title} (${w.priceFormatted}) in ${w.location.city}`).join('\n');
    const text = encodeURIComponent(
      `🏡 My Curated Real Estate Portfolio on Oye Properties:\nTotal Value: ${totalFormatted}\n\n${listNames}\n\nExplore live: ${window.location.origin}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="drawer-right"
        onClick={e => e.stopPropagation()}
        style={{
          padding: isMobile ? '20px 16px' : '28px',
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          borderLeft: '1px solid var(--border-subtle)',
          boxShadow: 'var(--shadow-xl)'
        }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(225, 29, 72, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-rose)'
            }}>
              <Heart size={18} fill="currentColor" />
            </div>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)' }}>Saved Portfolio Wishlist</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                {wishlist.length} {wishlist.length === 1 ? 'Estate Saved' : 'Estates Saved'}
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

        {/* Portfolio Summary Card */}
        {wishlist.length > 0 && (
          <div style={{
            background: 'linear-gradient(135deg, #FFF0F1 0%, #FFE4E6 100%)',
            border: '1px solid rgba(231, 29, 43, 0.2)',
            borderRadius: 'var(--radius-md)',
            padding: '16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted)', fontWeight: 600 }}>
                Total Portfolio Asset Value
              </div>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: '24px',
                fontWeight: 800,
                color: 'var(--accent-primary)',
                marginTop: '2px'
              }}>
                {totalFormatted}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={handleShareWhatsApp}
                className="btn-whatsapp"
                style={{ fontSize: '11px', padding: '6px 10px' }}
                title="Share Portfolio on WhatsApp"
              >
                <Share2 size={12} />
                <span>WhatsApp</span>
              </button>
              <button
                onClick={handleShareWishlist}
                className="btn-secondary"
                style={{ fontSize: '11px', padding: '6px 10px' }}
              >
                {copiedLink ? <Check size={12} /> : <Share2 size={12} />}
                {copiedLink ? 'Copied' : 'Link'}
              </button>
            </div>
          </div>
        )}

        {/* Wishlist Items List */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {wishlist.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-secondary)'
            }}>
              <Heart size={44} color="var(--border-subtle)" style={{ margin: '0 auto 16px' }} />
              <h4 style={{ color: 'var(--text-primary)', fontSize: '16px', marginBottom: '6px', fontWeight: 700 }}>Your Wishlist is Empty</h4>
              <p style={{ fontSize: '13px', marginBottom: '20px', color: 'var(--text-muted)' }}>
                Tap the heart icon on any reel or property card to save your favorite luxury residences here without logging in.
              </p>
              <button onClick={onClose} className="btn-primary">
                Explore Reel Catalogue
              </button>
            </div>
          ) : (
            wishlist.map(item => (
              <div
                key={item.id}
                style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: '12px',
                  display: 'flex',
                  gap: '12px',
                  position: 'relative'
                }}
              >
                <img
                  src={item.images[0]}
                  alt={item.title}
                  style={{ width: '84px', height: '84px', borderRadius: '8px', objectFit: 'cover' }}
                />

                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.2 }}>
                        {item.title}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '2px'
                        }}
                        title="Remove"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      {item.location.locality}, {item.location.city}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '6px' }}>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: '15px',
                      fontWeight: 800,
                      color: 'var(--accent-primary)'
                    }}>
                      {item.priceFormatted}
                    </div>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => {
                          onClose();
                          onOpenDetail(item);
                        }}
                        className="btn-secondary"
                        style={{ fontSize: '11px', padding: '5px 8px' }}
                      >
                        Know More
                      </button>

                      <button
                        onClick={() => {
                          onClose();
                          onOpenCallback(item);
                        }}
                        className="btn-primary"
                        style={{ fontSize: '11px', padding: '5px 10px' }}
                      >
                        <PhoneCall size={12} />
                        Call Back
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {wishlist.length > 0 && (
          <div style={{
            borderTop: '1px solid var(--border-subtle)',
            paddingTop: '16px',
            marginTop: '16px',
            paddingBottom: 'max(16px, env(safe-area-inset-bottom, 16px))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            flexWrap: 'wrap'
          }}>
            <button
              onClick={onClearWishlist}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-muted)',
                fontSize: '12px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}
            >
              <Trash2 size={13} />
              Clear Wishlist
            </button>

            <button
              onClick={() => {
                onClose();
                onOpenCallback(wishlist[0]);
              }}
              className="btn-primary"
              style={{ fontSize: '13px' }}
            >
              <PhoneCall size={14} />
              Inquire Selected Estates
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
