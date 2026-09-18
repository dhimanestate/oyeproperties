import React, { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  PhoneCall, 
  MapPin, 
  Compass, 
  Calculator, 
  Sparkles,
  Share2,
  MessageCircle,
  CheckCircle2,
  Zap
} from 'lucide-react';

export default function PropertyDetailModal({
  property,
  onClose,
  isWishlisted,
  onToggleWishlist,
  onOpenCallback
}) {
  if (!property) return null;

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // EMI Calculator State
  const [downpaymentPercent, setDownpaymentPercent] = useState(20);
  const [loanTenureYears, setLoanTenureYears] = useState(20);
  const interestRateAnnual = 8.5;

  const downpaymentAmount = (property.price * downpaymentPercent) / 100;
  const loanPrincipal = property.price - downpaymentAmount;
  const monthlyRate = interestRateAnnual / 12 / 100;
  const numberOfPayments = loanTenureYears * 12;
  
  const monthlyEMI = Math.round(
    (loanPrincipal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1)
  );

  const formatCurrency = (val) => {
    if (val >= 10000000) {
      return `₹${(val / 10000000).toFixed(2)} Cr`;
    } else if (val >= 100000) {
      return `₹${(val / 100000).toFixed(2)} Lacs`;
    }
    return `₹${val.toLocaleString()}`;
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🏡 Check out this luxury residence on Oye Properties:\n*${property.title}*\n📍 ${property.location.address}\n💰 Asking: ${property.priceFormatted} (${property.pricePerSqFt})\n✨ Specs: ${property.bhk} BHK • ${property.areaSqFt} sq.ft\n🔗 Explore here: ${window.location.origin}?prop=${property.id}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  return (
    <div 
      className="modal-backdrop" 
      onClick={onClose} 
      style={{ 
        padding: isMobile ? 0 : '20px',
        alignItems: isMobile ? 'flex-end' : 'center',
        justifyContent: 'center'
      }}
    >
      <div 
        className="glass-panel-heavy"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: isMobile ? '100%' : '880px',
          height: isMobile ? '86vh' : 'auto',
          maxHeight: isMobile ? '86vh' : '92vh',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          borderTopLeftRadius: isMobile ? '24px' : 'var(--radius-lg)',
          borderTopRightRadius: isMobile ? '24px' : 'var(--radius-lg)',
          borderBottomLeftRadius: isMobile ? 0 : 'var(--radius-lg)',
          borderBottomRightRadius: isMobile ? 0 : 'var(--radius-lg)',
          position: 'relative',
          padding: 0,
          background: '#ffffff',
          boxShadow: isMobile ? '0 -10px 40px rgba(0,0,0,0.35)' : 'var(--shadow-lg)',
          margin: 0
        }}
      >
        {/* Mobile Pull Handle */}
        {isMobile && (
          <div style={{
            width: '100%',
            display: 'flex',
            justifyContent: 'center',
            paddingTop: '8px',
            paddingBottom: '2px',
            background: '#ffffff',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px'
          }}>
            <div style={{
              width: '42px',
              height: '4.5px',
              borderRadius: 'var(--radius-full)',
              background: 'rgba(0, 0, 0, 0.2)'
            }} />
          </div>
        )}
        {/* Top Header Sticky Bar */}
        <div style={{
          position: 'sticky',
          top: 0,
          background: '#ffffff',
          borderBottom: '1px solid var(--border-subtle)',
          padding: isMobile ? '10px 14px' : '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 20
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
            <span style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              color: 'var(--accent-primary)',
              padding: '3px 10px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '11px',
              fontWeight: 800,
              whiteSpace: 'nowrap'
            }}>
              {property.propertyType}
            </span>
            <span style={{ 
              fontSize: isMobile ? '11px' : '12px', 
              color: 'var(--text-muted)',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap'
            }}>
              RERA: {property.builder.reraId}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
            <button
              onClick={handleShareWhatsApp}
              className="btn-whatsapp"
              style={{ fontSize: '11px', padding: '5px 10px', gap: '4px' }}
              title="Share via WhatsApp"
            >
              <MessageCircle size={13} />
              <span>Share</span>
            </button>

            <button
              onClick={() => onToggleWishlist(property)}
              style={{
                background: isWishlisted ? '#fee2e2' : 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                color: isWishlisted ? '#e11d48' : 'var(--text-secondary)',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title={isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
            >
              <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'var(--bg-secondary)',
                border: 'none',
                color: 'var(--text-muted)',
                width: '34px',
                height: '34px',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer'
              }}
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Hero Gallery / 360 / Floorplan Container */}
        <div style={{ padding: isMobile ? '14px 14px 0' : '24px 24px 0' }}>
          {/* Navigation Tabs (Horizontal Scrollable on Mobile) */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '14px',
            borderBottom: '1px solid var(--border-subtle)',
            paddingBottom: '10px',
            overflowX: 'auto',
            flexWrap: 'nowrap',
            WebkitOverflowScrolling: 'touch',
            scrollbarWidth: 'none'
          }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                background: activeTab === 'overview' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: activeTab === 'overview' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                padding: isMobile ? '6px 14px' : '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: isMobile ? '12px' : '13px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              Gallery & Overview
            </button>

            <button
              onClick={() => setActiveTab('360tour')}
              style={{
                background: activeTab === '360tour' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: activeTab === '360tour' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                padding: isMobile ? '6px 14px' : '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: isMobile ? '12px' : '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <Compass size={14} />
              360° Virtual Tour
            </button>

            <button
              onClick={() => setActiveTab('floorplan')}
              style={{
                background: activeTab === 'floorplan' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: activeTab === 'floorplan' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                padding: isMobile ? '6px 14px' : '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: isMobile ? '12px' : '13px',
                fontWeight: 700,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              Floor Plan Blueprint
            </button>

            <button
              onClick={() => setActiveTab('calculator')}
              style={{
                background: activeTab === 'calculator' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                color: activeTab === 'calculator' ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                padding: isMobile ? '6px 14px' : '8px 16px',
                borderRadius: 'var(--radius-full)',
                fontSize: isMobile ? '12px' : '13px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                whiteSpace: 'nowrap',
                flexShrink: 0
              }}
            >
              <Calculator size={14} />
              Live EMI & ROI
            </button>
          </div>

          {/* TAB 1: Gallery & Overview */}
          {activeTab === 'overview' && (
            <div>
              <div style={{
                position: 'relative',
                height: isMobile ? '230px' : '360px',
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                marginBottom: '10px'
              }}>
                <img
                  src={property.images[selectedPhotoIndex] || property.images[0]}
                  alt={property.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  right: '10px',
                  background: 'rgba(11, 28, 61, 0.85)',
                  backdropFilter: 'blur(8px)',
                  padding: '3px 10px',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '10.5px',
                  color: '#fff',
                  fontWeight: 600
                }}>
                  Photo {selectedPhotoIndex + 1} of {property.images.length}
                </div>
              </div>

              {/* Thumbnails Row */}
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', scrollbarWidth: 'none' }}>
                {property.images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt="Thumbnail"
                    onClick={() => setSelectedPhotoIndex(i)}
                    style={{
                      width: isMobile ? '62px' : '72px',
                      height: isMobile ? '46px' : '52px',
                      borderRadius: '8px',
                      objectFit: 'cover',
                      cursor: 'pointer',
                      flexShrink: 0,
                      border: selectedPhotoIndex === i ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                      opacity: selectedPhotoIndex === i ? 1 : 0.65
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: 360 Virtual Tour Simulation */}
          {activeTab === '360tour' && (
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: isMobile ? '12px' : '20px',
              position: 'relative'
            }}>
              <div style={{
                height: isMobile ? '230px' : '360px',
                position: 'relative',
                borderRadius: '10px',
                overflow: 'hidden'
              }}>
                <img
                  src={property.virtualTour360.preview}
                  alt="360 preview"
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  background: 'rgba(255, 255, 255, 0.95)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  color: 'var(--accent-primary)',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.15)'
                }}>
                  <Compass size={13} className="animate-spin" style={{ animationDuration: '6s' }} />
                  Interactive 360° Walkthrough
                </div>

                {/* Hotspots */}
                <div style={{
                  position: 'absolute',
                  bottom: '10px',
                  left: '10px',
                  right: '10px',
                  display: 'flex',
                  gap: '6px',
                  flexWrap: 'wrap',
                  background: 'rgba(255, 255, 255, 0.95)',
                  padding: '8px',
                  borderRadius: 'var(--radius-md)',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
                }}>
                  <span style={{ fontSize: '10.5px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', fontWeight: 600 }}>
                    Rooms:
                  </span>
                  {property.virtualTour360.rooms.map((room, idx) => (
                    <button
                      key={room}
                      onClick={() => setSelectedPhotoIndex(idx % property.images.length)}
                      style={{
                        background: 'var(--bg-secondary)',
                        border: '1px solid var(--border-subtle)',
                        color: 'var(--accent-primary)',
                        padding: '3px 9px',
                        borderRadius: 'var(--radius-full)',
                        fontSize: '10.5px',
                        fontWeight: 600,
                        cursor: 'pointer'
                      }}
                    >
                      📍 {room}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Floor Plan Blueprint */}
          {activeTab === 'floorplan' && (
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: isMobile ? '14px' : '20px',
              textAlign: 'center'
            }}>
              <h4 style={{ color: 'var(--text-primary)', fontSize: isMobile ? '14px' : '16px', marginBottom: '4px', fontWeight: 800 }}>
                Master Floor Plan Architectural Layout
              </h4>
              <p style={{ fontSize: isMobile ? '11px' : '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                Super Built-up: {property.areaSqFt} sq.ft | Carpet Area: {property.carpetAreaSqFt} sq.ft
              </p>
              <div style={{
                maxHeight: isMobile ? '240px' : '340px',
                display: 'flex',
                justifyContent: 'center',
                background: '#ffffff',
                borderRadius: '8px',
                padding: '10px',
                border: '1px solid var(--border-subtle)'
              }}>
                <img
                  src={property.floorPlanUrl}
                  alt="Architectural Blueprint"
                  style={{ maxHeight: isMobile ? '220px' : '310px', maxWidth: '100%', objectFit: 'contain' }}
                />
              </div>
            </div>
          )}

          {/* TAB 4: Live EMI & ROI Calculator */}
          {activeTab === 'calculator' && (
            <div style={{
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              padding: isMobile ? '16px' : '24px'
            }}>
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', 
                gap: isMobile ? '16px' : '24px' 
              }}>
                <div>
                  <h4 style={{ color: 'var(--text-primary)', fontSize: '14px', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 800 }}>
                    <Calculator size={15} color="var(--accent-primary)" />
                    Customize Loan Parameters
                  </h4>

                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Down Payment: {downpaymentPercent}%</span>
                      <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>{formatCurrency(downpaymentAmount)}</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="50"
                      step="5"
                      value={downpaymentPercent}
                      onChange={e => setDownpaymentPercent(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                    />
                  </div>

                  <div style={{ marginBottom: '14px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>Loan Tenure</span>
                      <span style={{ color: 'var(--accent-primary)', fontWeight: 800 }}>{loanTenureYears} Years</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="30"
                      step="1"
                      value={loanTenureYears}
                      onChange={e => setLoanTenureYears(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--accent-primary)' }}
                    />
                  </div>

                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Benchmark interest: 8.50% p.a. Special luxury rates apply.
                  </div>
                </div>

                {/* Calculation Outputs Card */}
                <div style={{
                  background: '#ffffff',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: 'var(--radius-md)',
                  padding: isMobile ? '16px' : '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)',
                  gap: '14px'
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>
                      Estimated Monthly EMI
                    </div>
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: isMobile ? '26px' : '32px',
                      fontWeight: 800,
                      color: 'var(--accent-primary)',
                      marginTop: '4px'
                    }}>
                      {formatCurrency(monthlyEMI)}
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-muted)' }}> /mo</span>
                    </div>
                  </div>

                  <div style={{
                    borderTop: '1px solid var(--border-subtle)',
                    paddingTop: '12px',
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px'
                  }}>
                    <div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Gross Rental Yield</div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent-emerald)' }}>
                        {property.financials.grossRentalYield}
                      </div>
                    </div>

                    <div>
                      <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 600 }}>5-Yr Capital Gain Est.</div>
                      <div style={{ fontSize: '15px', fontWeight: 800, color: '#E71D2B' }}>
                        {property.financials.projectedCapitalAppreciation5Yr}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Property Specs */}
        <div style={{ padding: isMobile ? '16px 14px' : '24px' }}>
          {/* Title and Price - Stacks cleanly on mobile */}
          <div style={{ 
            display: 'flex', 
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'flex-start', 
            justifyContent: 'space-between', 
            gap: isMobile ? '10px' : '20px', 
            marginBottom: '16px' 
          }}>
            <div>
              <h2 style={{ 
                fontSize: isMobile ? '18px' : '24px', 
                fontWeight: 800, 
                color: 'var(--text-primary)', 
                lineHeight: 1.25, 
                marginBottom: '4px' 
              }}>
                {property.title}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '12px' }}>
                <MapPin size={13} color="#E71D2B" />
                {property.location.address}
              </div>
            </div>

            <div style={{ textAlign: isMobile ? 'left' : 'right' }}>
              <div style={{
                fontFamily: 'var(--font-display)',
                fontSize: isMobile ? '22px' : '28px',
                fontWeight: 800,
                color: 'var(--accent-primary)'
              }}>
                {property.priceFormatted}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {property.pricePerSqFt}
              </div>
            </div>
          </div>

          {/* Quick Attribute Pills - Responsive Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fit, minmax(130px, 1fr))',
            gap: isMobile ? '8px' : '12px',
            marginBottom: '20px'
          }}>
            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '10px' }}>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Bedrooms</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{property.bhk} BHK Luxury</div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '10px' }}>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Carpet Area</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{property.carpetAreaSqFt} sq.ft</div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '10px' }}>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Facing</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{property.facing}</div>
            </div>

            <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '10px' }}>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Floor Level</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{property.floor}</div>
            </div>

            <div style={{ 
              background: 'var(--bg-secondary)', 
              border: '1px solid var(--border-subtle)', 
              borderRadius: '10px', 
              padding: '10px',
              gridColumn: isMobile ? 'span 2' : 'auto'
            }}>
              <div style={{ fontSize: '10.5px', color: 'var(--text-muted)', fontWeight: 600 }}>Possession Status</div>
              <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--text-primary)', marginTop: '2px' }}>{property.possession}</div>
            </div>
          </div>

          {/* Amenities Grid */}
          <div style={{ marginBottom: '20px' }}>
            <h4 style={{ color: 'var(--text-primary)', fontSize: '14px', fontWeight: 700, marginBottom: '10px' }}>
              Signature Amenities & Lifestyle Privileges
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {property.amenities.map((amenity) => (
                <span
                  key={amenity}
                  style={{
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    color: 'var(--text-primary)',
                    padding: '5px 12px',
                    borderRadius: 'var(--radius-full)',
                    fontSize: '11px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '5px'
                  }}
                >
                  <Sparkles size={11} color="#E71D2B" />
                  {amenity}
                </span>
              ))}
            </div>
          </div>

          {/* Relationship Manager Contact Bar & CTA */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-md)',
            padding: isMobile ? '12px' : '16px 20px',
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'stretch' : 'center',
            justifyContent: 'space-between',
            gap: isMobile ? '12px' : '16px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img
                src={property.relationshipManager.photo}
                alt={property.relationshipManager.name}
                style={{
                  width: '46px',
                  height: '46px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--accent-primary)',
                  flexShrink: 0
                }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {property.relationshipManager.name}
                  </span>
                  <span style={{
                    fontSize: '9.5px',
                    background: '#e0e7ff',
                    color: '#3730a3',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    fontWeight: 700
                  }}>
                    ★ {property.relationshipManager.rating}
                  </span>
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                  {property.relationshipManager.role}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
              <button
                onClick={handleShareWhatsApp}
                className="btn-whatsapp"
                style={{ 
                  flex: isMobile ? 1 : 'initial',
                  justifyContent: 'center',
                  fontSize: '11.5px', 
                  padding: '8px 14px' 
                }}
              >
                <MessageCircle size={14} />
                WhatsApp
              </button>

              <button
                id="btn-modal-schedule-callback"
                onClick={() => {
                  onClose();
                  onOpenCallback(property);
                }}
                className="btn-primary"
                style={{ 
                  flex: isMobile ? 1 : 'initial',
                  justifyContent: 'center',
                  fontSize: '11.5px', 
                  padding: '8px 16px' 
                }}
              >
                <PhoneCall size={14} />
                Call Back
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
