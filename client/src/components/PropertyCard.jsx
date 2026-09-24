import React, { useState } from 'react';
import { getMediaUrl } from '../config';
import { 
  Heart, 
  Zap, 
  Info, 
  PhoneCall, 
  MapPin, 
  BedDouble, 
  Bath, 
  Maximize2, 
  CheckCircle2,
  MessageCircle,
  Share2,
  Compass,
  Building2,
  Camera,
  Calendar
} from 'lucide-react';

export default function PropertyCard({
  property,
  isWishlisted,
  onToggleWishlist,
  onOpenDetail,
  onOpenCallback,
  onWatchReel,
  isCompared,
  onToggleCompare
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const handleShareWhatsApp = (e) => {
    e.stopPropagation();
    const adminPhone = '918930318532';
    const text = encodeURIComponent(
      `Hi, I am interested in ${property.title} located at ${property.location?.locality || ''}, ${property.location?.city || ''}.\nPrice: ${property.priceFormatted || ''} (${property.pricePerSqFt || ''})\nConfiguration: ${property.bhk ? `${property.bhk} BHK` : property.propertyType}\nLink: ${window.location.origin}?prop=${property.id}`
    );
    window.open(`https://wa.me/${adminPhone}?text=${text}`, '_blank');
  };

  const handleCardClick = (e) => {
    // Avoid double triggering if clicking interactive child elements (buttons, inputs, labels)
    if (e.target.closest('button') || e.target.closest('input') || e.target.closest('label') || e.target.closest('a')) {
      return;
    }
    if (onOpenDetail) {
      onOpenDetail(property);
    }
  };

  return (
    <div
      id={`property-card-${property.id}`}
      onClick={handleCardClick}
      style={{
        background: '#ffffff',
        border: isHovered ? '1.5px solid #E71D2B' : '1px solid #EDEDED',
        borderRadius: 'var(--radius-lg)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'all 0.28s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-4px)' : 'none',
        boxShadow: isHovered ? '0 16px 40px rgba(0,0,0,0.10)' : '0 1px 4px rgba(0,0,0,0.05)',
        position: 'relative',
        fontFamily: "'Poppins', sans-serif",
        cursor: 'pointer'
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Cover Image with Badges */}
      <div style={{ position: 'relative', width: '100%', height: 'clamp(180px, 45vw, 240px)', overflow: 'hidden', background: '#f5f5f5' }}>
        {/* Shimmer Image Preloader */}
        {!imageLoaded && (
          <div className="media-preloader">
            <div className="media-preloader-spinner" />
          </div>
        )}

        <img
          src={getMediaUrl(property.images?.[0])}
          alt={property.title}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageLoaded(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            opacity: imageLoaded ? 1 : 0,
            transition: 'opacity 0.35s ease'
          }}
        />

        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(15,23,42,0.25) 0%, rgba(15,23,42,0) 45%, rgba(15,23,42,0.85) 100%)',
          pointerEvents: 'none'
        }} />

        {/* Top Badges */}
        <div style={{
          position: 'absolute',
          top: '14px',
          left: '14px',
          display: 'flex',
          gap: '6px'
        }}>
          {property.reelVideo && (
            <button
              id={`btn-card-watch-reel-${property.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onWatchReel(property);
              }}
              style={{
                background: 'rgba(255,255,255,0.95)',
                color: '#E71D2B',
                border: 'none',
                padding: '5px 12px',
                borderRadius: '9999px',
                fontSize: '11px',
                fontWeight: 600,
                fontFamily: "'Poppins', sans-serif",
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.18)'
              }}
            >
              <Zap size={13} color="#E71D2B" fill="#E71D2B" />
              Watch Instant
            </button>
          )}

          {property.isOwnerListing && (
            <span style={{
              background: '#E71D2B',
              color: '#ffffff',
              padding: '5px 10px',
              borderRadius: '9999px',
              fontSize: '11px',
              fontWeight: 600,
              fontFamily: "'Poppins', sans-serif",
            }}>
              Owner Listing
            </span>
          )}
        </div>

        {/* Wishlist & WhatsApp Buttons on Image */}
        <div style={{ position: 'absolute', top: '14px', right: '14px', display: 'flex', gap: '6px' }}>
          {/* WhatsApp Share */}
          <button
            onClick={handleShareWhatsApp}
            style={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              color: '#25d366',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
            title="Share via WhatsApp"
          >
            <MessageCircle size={17} />
          </button>

          {/* Wishlist */}
          <button
            id={`btn-card-heart-${property.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(property);
            }}
            style={{
              background: isWishlisted ? '#E71D2B' : 'rgba(255, 255, 255, 0.95)',
              border: 'none',
              color: '#ffffff',
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}
            title={isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
          >
            <Heart size={16} fill={isWishlisted ? '#ffffff' : '#999'} color={isWishlisted ? '#ffffff' : '#999'} />
          </button>
        </div>

        {/* Bottom Image Info: Price Tag & Locality */}
        <div style={{
          position: 'absolute',
          bottom: '12px',
          left: '14px',
          right: '14px',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '22px',
              fontWeight: 700,
              color: '#ffffff',
              textShadow: '0 2px 10px rgba(0,0,0,0.65)',
            }}>
              {property.priceFormatted}
            </div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.75)', fontFamily: "'Poppins', sans-serif" }}>
              {property.pricePerSqFt}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
            {property.images?.length > 1 && (
              <span style={{
                background: 'rgba(0,0,0,0.65)',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: '999px',
                fontSize: '10px',
                fontWeight: 600,
                backdropFilter: 'blur(4px)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Camera size={10} /> {property.images.length} Photos
              </span>
            )}
            <div style={{
              background: 'rgba(255,255,255,0.95)',
              padding: '4px 10px',
              borderRadius: '8px',
              fontSize: '11px',
              color: '#555555',
              fontWeight: 500,
              fontFamily: "'Poppins', sans-serif",
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <MapPin size={12} color="#E71D2B" />
              {property.location.locality || property.location.address}, {property.location.city}
            </div>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div style={{ padding: 'clamp(12px, 4vw, 18px)', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#E71D2B', fontWeight: 600, fontFamily: "'Poppins', sans-serif" }}>
            {property.propertyType} {property.bhk ? `• ${property.bhk} BHK` : ''}
          </span>
          {property.verified && (
            <span style={{ fontSize: '11px', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '3px', fontWeight: 500, fontFamily: "'Poppins', sans-serif" }}>
              <CheckCircle2 size={12} /> Verified
            </span>
          )}
        </div>

        <h3 style={{
          fontSize: '15px',
          fontWeight: 600,
          fontFamily: "'Poppins', sans-serif",
          color: '#1F1F1F',
          lineHeight: 1.3,
          marginBottom: '6px',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {property.title}
        </h3>

        <p style={{
          fontSize: '12px',
          color: 'var(--text-muted)',
          lineHeight: 1.4,
          marginBottom: '12px',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden'
        }}>
          {property.tagline}
        </p>

        {/* 10-Point Specs Icons Row: BHK, Area (Sq. Ft./Sq. Yds.), Floor */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '6px',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-subtle)',
          borderRadius: 'var(--radius-sm)',
          padding: '8px 10px',
          marginBottom: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <BedDouble size={14} color="var(--accent-primary)" />
            <span style={{ fontWeight: 600 }}>{property.bhk ? `${property.bhk} BHK` : property.propertyType}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <Maximize2 size={14} color="var(--accent-primary)" />
            <span style={{ fontWeight: 600 }}>
              {property.areaSqFt ? `${property.areaSqFt.toLocaleString()} ${property.areaUnit || 'Sq. Ft.'}` : `${property.carpetAreaSqFt} sq.ft`}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-secondary)' }}>
            <Building2 size={13} color="var(--accent-primary)" />
            <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={property.floor || 'Floor Level'}>
              {property.floor || 'Upper Level'}
            </span>
          </div>
        </div>

        {/* Availability & Facing Tags Row */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '6px',
          marginBottom: '14px'
        }}>
          {/* Availability / Status */}
          <span style={{
            background: 'rgba(22, 163, 74, 0.08)',
            border: '1px solid rgba(22, 163, 74, 0.2)',
            color: '#16a34a',
            padding: '3px 8px',
            borderRadius: '9999px',
            fontSize: '10.5px',
            fontWeight: 500,
            fontFamily: "'Poppins', sans-serif",
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <CheckCircle2 size={10} /> {property.status}
          </span>

          {/* Builder Floor Floor-wise indicator */}
          {property.floorPricing?.length > 0 && (
            <span style={{
              background: '#FFF1F2',
              border: '1px solid #FECDD3',
              color: '#E71D2B',
              padding: '3px 8px',
              borderRadius: '9999px',
              fontSize: '10.5px',
              fontWeight: 600,
              fontFamily: "'Poppins', sans-serif",
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Building2 size={11} /> {property.floorPricing.length} Floors Available
            </span>
          )}

          {/* Direction Facing */}
          {property.facing && (
            <span style={{
              background: '#F5F5F5',
              border: '1px solid #EDEDED',
              color: '#555555',
              padding: '3px 8px',
              borderRadius: '9999px',
              fontSize: '10.5px',
              fontWeight: 500,
              fontFamily: "'Poppins', sans-serif",
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Compass size={11} />
              {property.facing}
            </span>
          )}

          {/* Possession Timeline */}
          {property.possession && (
            <span style={{
              background: '#F5F5F5',
              border: '1px solid #EDEDED',
              color: '#555555',
              padding: '3px 8px',
              borderRadius: '9999px',
              fontSize: '10.5px',
              fontWeight: 500,
              fontFamily: "'Poppins', sans-serif",
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Calendar size={11} />
              {property.possession}
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '11px',
            color: isCompared ? 'var(--accent-primary)' : 'var(--text-muted)',
            cursor: 'pointer',
            userSelect: 'none',
            fontWeight: 600
          }}>
            <input
              type="checkbox"
              checked={isCompared}
              onChange={() => onToggleCompare(property)}
              style={{ accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
            />
            <span>Compare specs</span>
          </label>

          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            By {property.builder.name}
          </span>
        </div>

        {/* Action Buttons: Dark Blue Primary + Clean White Secondary */}
        <div style={{ display: 'flex', gap: '8px', marginTop: 'auto' }}>
          <button
            id={`btn-card-know-more-${property.id}`}
            onClick={() => onOpenDetail(property)}
            className="btn-secondary"
            style={{ flex: 1, justifyContent: 'center', fontSize: '12px', padding: '10px 8px', minHeight: '42px' }}
          >
            <Info size={14} />
            Know More
          </button>

          <button
            id={`btn-card-callback-${property.id}`}
            onClick={() => onOpenCallback(property)}
            className="btn-primary"
            style={{ flex: 1, justifyContent: 'center', fontSize: '12px', padding: '10px 8px', minHeight: '42px' }}
          >
            <PhoneCall size={14} />
            Call Back
          </button>
        </div>
      </div>
    </div>
  );
}
