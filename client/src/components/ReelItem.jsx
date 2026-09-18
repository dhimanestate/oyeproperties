import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  Heart, 
  Info, 
  PhoneCall, 
  Share2, 
  Volume2, 
  VolumeX, 
  MapPin, 
  BedDouble, 
  Maximize2, 
  CheckCircle2, 
  MessageCircle, 
  Sparkles, 
  Bath, 
  Compass, 
  ShieldCheck, 
  Check, 
  Play, 
  Pause, 
  Calculator, 
  Images, 
  Award,
  ChevronRight,
  ChevronLeft,
  Maximize
} from 'lucide-react';

export default function ReelItem({
  property,
  isActive,
  isMuted,
  onToggleMute,
  isWishlisted,
  onToggleWishlist,
  onOpenDetail,
  onOpenCallback,
  isMobile
}) {
  const videoRef = useRef(null);
  const carouselRef = useRef(null);
  const desktopCarouselRef = useRef(null);
  const [activeMediaIndex, setActiveMediaIndex] = useState(0);
  const [likesCount, setLikesCount] = useState(property.likesCount || 1280);
  const [showHeartBurst, setShowHeartBurst] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showPlayOverlay, setShowPlayOverlay] = useState(false);

  // Full media list for sideways carousel: video first, then all high-res photos
  const mediaItems = useMemo(() => {
    const list = [];
    if (property.reelVideo) {
      list.push({
        id: `${property.id}-media-video`,
        type: 'video',
        src: property.reelVideo,
        poster: property.images?.[0],
        title: 'Cinematic Reel Tour'
      });
    }
    if (Array.isArray(property.images)) {
      property.images.forEach((img, idx) => {
        list.push({
          id: `${property.id}-media-img-${idx}`,
          type: 'image',
          src: img,
          title: idx === 0 ? 'Exterior Elevation' : `Interior View ${idx + 1}`
        });
      });
    }
    return list.length > 0 ? list : [{ id: `${property.id}-media-fallback`, type: 'image', src: property.images?.[0] }];
  }, [property]);

  // Auto-play / pause video when slide enters / leaves active viewport or changes media slide
  useEffect(() => {
    if (videoRef.current) {
      if (isActive && activeMediaIndex === 0) {
        videoRef.current.currentTime = 0;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(() => {
              if (videoRef.current) {
                videoRef.current.muted = true;
                videoRef.current.play().catch(() => {});
                setIsPlaying(true);
              }
            });
        }
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isActive, activeMediaIndex]);

  // Reset to first slide (video) when scrolling away to another property
  useEffect(() => {
    if (!isActive) {
      setActiveMediaIndex(0);
      if (carouselRef.current) {
        carouselRef.current.scrollLeft = 0;
      }
      if (desktopCarouselRef.current) {
        desktopCarouselRef.current.scrollLeft = 0;
      }
    }
  }, [isActive]);

  const scrollToMedia = (idx, e) => {
    e?.stopPropagation();
    if (idx < 0 || idx >= mediaItems.length) return;
    setActiveMediaIndex(idx);
    if (carouselRef.current) {
      const slide = carouselRef.current.children[idx];
      if (slide) {
        carouselRef.current.scrollTo({
          left: slide.offsetLeft,
          behavior: 'smooth'
        });
      }
    }
    if (desktopCarouselRef.current) {
      const slide = desktopCarouselRef.current.children[idx];
      if (slide) {
        desktopCarouselRef.current.scrollTo({
          left: slide.offsetLeft,
          behavior: 'smooth'
        });
      }
    }
  };

  const handleCarouselScroll = (e) => {
    const container = e.currentTarget;
    if (!container || container.clientWidth === 0) return;
    const newIdx = Math.round(container.scrollLeft / container.clientWidth);
    if (newIdx !== activeMediaIndex && newIdx >= 0 && newIdx < mediaItems.length) {
      setActiveMediaIndex(newIdx);
    }
  };

  // Sync mute state with video element
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.muted = isMuted;
    }
  }, [isMuted]);


  const handleTogglePlay = (e) => {
    e?.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    setShowPlayOverlay(true);
    setTimeout(() => setShowPlayOverlay(false), 700);
  };

  const handleLike = (e) => {
    e?.stopPropagation();
    setShowHeartBurst(true);
    setTimeout(() => setShowHeartBurst(false), 800);

    if (!isWishlisted) {
      setLikesCount(prev => prev + 1);
    } else {
      setLikesCount(prev => Math.max(0, prev - 1));
    }
    onToggleWishlist(property);
  };

  const handleShareWhatsApp = (e) => {
    e?.stopPropagation();
    const text = encodeURIComponent(
      `🏡 Check out this luxury residence on Oye Properties:\n*${property.title}*\n📍 ${property.location.locality}, ${property.location.city}\n💰 Asking: ${property.priceFormatted} (${property.pricePerSqFt})\n✨ Specs: ${property.bhk} BHK • ${property.areaSqFt} sq.ft\n🔗 Explore here: ${window.location.origin}?prop=${property.id}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleFullscreenVideo = (e) => {
    e?.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      } else if (videoRef.current.webkitRequestFullscreen) {
        videoRef.current.webkitRequestFullscreen();
      }
    }
  };

  // Calculate estimated monthly EMI (approx 8.5% over 20 years = 0.86% factor per month)
  const estMonthlyEmi = Math.round((property.price * 0.0086) / 100000 * 10) / 10;

  // ==========================================
  // DESKTOP FULL-WIDTH HORIZONTAL SLIDER VIEW
  // ==========================================
  if (!isMobile) {
    return (
      <div className="reel-slide reel-card" id={`reel-slide-${property.id}`}>
        {/* Left Side: Pure White Master Estate Card */}
        <div className="reel-desktop-info-panel">
          <div>
            {/* Top Row: Location & Verified / Owner Badges */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{
                background: 'var(--bg-secondary)',
                border: '1px solid var(--border-subtle)',
                padding: '5px 12px',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '12px',
                color: 'var(--accent-primary)',
                fontWeight: 700
              }}>
                <MapPin size={13} color="#2563eb" />
                <span>{property.location.locality}, {property.location.city}</span>
              </div>

              {property.isOwnerListing ? (
                <div style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <CheckCircle2 size={12} />
                  Direct Owner Listed
                </div>
              ) : (
                <div style={{
                  background: '#ecfdf5',
                  border: '1px solid #a7f3d0',
                  color: '#047857',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '11px',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  <ShieldCheck size={12} />
                  Verified RERA Estate
                </div>
              )}
            </div>

            {/* Price Showcase with Estimated EMI Badge */}
            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '2px' }}>
                Offered Price
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', flexWrap: 'wrap' }}>
                <span style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '34px',
                  fontWeight: 800,
                  color: 'var(--accent-primary)',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.1
                }}>
                  {property.priceFormatted}
                </span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  ({property.pricePerSqFt})
                </span>
              </div>

              {/* Estimated EMI Pill */}
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                marginTop: '6px',
                background: '#f8fafc',
                border: '1px solid var(--border-subtle)',
                padding: '3px 8px',
                borderRadius: 'var(--radius-sm)',
                fontSize: '11px',
                color: 'var(--text-secondary)'
              }}>
                <Calculator size={12} color="#2563eb" />
                <span>Est. EMI: <strong style={{ color: 'var(--accent-primary)' }}>₹{estMonthlyEmi} L/mo*</strong></span>
              </div>
            </div>

            {/* Title & Poetic Architectural Tagline */}
            <h2 style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '23px',
              fontWeight: 800,
              color: 'var(--text-primary)',
              lineHeight: 1.25,
              marginBottom: '6px'
            }}>
              {property.title}
            </h2>

            <p style={{
              fontSize: '13px',
              color: 'var(--text-secondary)',
              lineHeight: 1.45,
              marginBottom: '16px'
            }}>
              {property.tagline}
            </p>

            {/* Core Specifications 4-Tile Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '8px',
              marginBottom: '16px',
              background: 'var(--bg-secondary)',
              padding: '12px 14px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <BedDouble size={16} color="#2563eb" />
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Configuration</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)' }}>{property.bhk} BHK Suite</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Maximize2 size={16} color="#2563eb" />
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Carpet Area</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)' }}>{property.areaSqFt.toLocaleString()} sq.ft</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Bath size={16} color="#2563eb" />
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Bathrooms</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)' }}>{property.baths || property.bhk} Luxury Baths</div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Compass size={16} color="#2563eb" />
                <div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Availability</div>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#047857' }}>{property.status}</div>
                </div>
              </div>

              {property.facing && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Compass size={16} color="#b45309" />
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 600 }}>Facing</div>
                    <div style={{ fontSize: '13px', fontWeight: 700, color: '#b45309' }}>{property.facing}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Signature Amenities */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 700, marginBottom: '6px' }}>
                Signature Highlights
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px' }}>
                {(property.amenities || ['Private Infinity Pool', 'Sea View Terrace', 'Private Lift', 'Smart Home Automation']).slice(0, 4).map((am, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-primary)', fontWeight: 600 }}>
                    <span style={{
                      width: '14px',
                      height: '14px',
                      borderRadius: '50%',
                      background: '#eff6ff',
                      color: '#2563eb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '9px',
                      flexShrink: 0
                    }}>✓</span>
                    <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{am}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Mini Photo Gallery Strip (Preview More Views) */}
            {property.images && property.images.length > 0 && (
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--text-muted)', fontWeight: 700 }}>
                    Architectural Views
                  </span>
                  <button 
                    onClick={() => onOpenDetail(property)}
                    style={{ background: 'none', border: 'none', color: '#2563eb', fontSize: '11px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '2px' }}
                  >
                    <span>View Gallery</span>
                    <ChevronRight size={12} />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {property.images.slice(0, 3).map((img, idx) => (
                    <div 
                      key={idx}
                      onClick={() => onOpenDetail(property)}
                      style={{
                        flex: 1,
                        height: '52px',
                        borderRadius: 'var(--radius-sm)',
                        overflow: 'hidden',
                        cursor: 'pointer',
                        position: 'relative',
                        border: '1px solid var(--border-subtle)'
                      }}
                    >
                      <img 
                        src={img} 
                        alt="Property Preview" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Clusters (100% User Friendly & High Contrast) */}
          <div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <button
                id={`btn-desktop-callback-${property.id}`}
                onClick={() => onOpenCallback(property)}
                className="btn-primary"
                style={{ flex: 1.1, justifyContent: 'center', padding: '12px 14px', fontSize: '13px' }}
              >
                <PhoneCall size={15} />
                <span>Get a Call Back</span>
              </button>

              <button
                id={`btn-desktop-knowmore-${property.id}`}
                onClick={() => onOpenDetail(property)}
                className="btn-secondary"
                style={{ flex: 1, justifyContent: 'center', padding: '12px 14px', fontSize: '13px' }}
              >
                <Info size={15} />
                <span>Deep Specs & Tour</span>
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                id={`btn-desktop-whatsapp-${property.id}`}
                onClick={handleShareWhatsApp}
                className="btn-whatsapp"
                style={{ flex: 1, justifyContent: 'center', padding: '9px 12px', fontSize: '12px' }}
                title="Share Estate Brochure on WhatsApp"
              >
                <MessageCircle size={15} />
                <span>WhatsApp Brochure</span>
              </button>

              <button
                id={`btn-desktop-wishlist-${property.id}`}
                onClick={handleLike}
                className={`btn-secondary ${isWishlisted ? 'active-heart' : ''}`}
                style={{
                  padding: '9px 14px',
                  fontSize: '12px',
                  color: isWishlisted ? '#f43f5e' : 'var(--text-secondary)',
                  borderColor: isWishlisted ? '#f43f5e' : 'var(--border-subtle)',
                  background: isWishlisted ? '#fff1f2' : 'var(--bg-secondary)',
                  gap: '6px'
                }}
                title="Save to Wishlist Portfolio"
              >
                <Heart size={15} fill={isWishlisted ? 'currentColor' : 'none'} />
                <span>{isWishlisted ? 'Saved' : 'Wishlist'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Full-Height Cinematic Video Canvas (Zero Blank Area Left & Right) */}
        <div 
          className="reel-desktop-video-panel"
          style={{ position: 'relative', overflow: 'hidden' }}
        >
          {/* Horizontal Media Carousel */}
          <div 
            ref={desktopCarouselRef}
            className="reel-media-carousel"
            onScroll={handleCarouselScroll}
          >
            {mediaItems.map((item, idx) => (
              <div 
                key={`desktop-${item.id}`} 
                className="reel-media-slide" 
                onClick={handleTogglePlay}
                style={{ cursor: 'pointer' }}
              >
                {item.type === 'video' ? (
                  <video
                    ref={videoRef}
                    src={item.src}
                    poster={item.poster}
                    loop
                    muted={isMuted}
                    playsInline
                  />
                ) : (
                  <img
                    src={item.src}
                    alt={`${property.title} - View ${idx}`}
                    className="reel-carousel-image"
                    loading={idx < 2 ? 'eager' : 'lazy'}
                  />
                )}
              </div>
            ))}
          </div>

          <div className="reel-desktop-video-overlay" />

          {/* Desktop Media Carousel Indicators */}
          {mediaItems.length > 1 && (
            <div className="reel-carousel-indicator-wrap desktop-pos">
              <div className="reel-carousel-dots">
                {mediaItems.map((_, i) => (
                  <button
                    key={`d-dot-${i}`}
                    type="button"
                    onClick={(e) => scrollToMedia(i, e)}
                    className={`reel-carousel-dot ${i === activeMediaIndex ? 'active' : ''}`}
                    title={`View media ${i + 1}`}
                  />
                ))}
              </div>
              <div className="reel-carousel-counter-badge">
                {activeMediaIndex === 0 && mediaItems[0].type === 'video' ? (
                  <>
                    <Play size={10} fill="#ffffff" />
                    <span>Video 1/{mediaItems.length}</span>
                  </>
                ) : (
                  <>
                    <Images size={11} />
                    <span>Photo {activeMediaIndex + 1}/{mediaItems.length}</span>
                  </>
                )}
              </div>
            </div>
          )}

          {/* Desktop Left/Right Media Chevrons */}
          {mediaItems.length > 1 && activeMediaIndex > 0 && (
            <button
              type="button"
              className="reel-media-nav-btn desktop-pos prev"
              onClick={(e) => scrollToMedia(activeMediaIndex - 1, e)}
              title="Previous photo"
            >
              <ChevronLeft size={22} strokeWidth={2.4} />
            </button>
          )}

          {mediaItems.length > 1 && activeMediaIndex < mediaItems.length - 1 && (
            <button
              type="button"
              className="reel-media-nav-btn desktop-pos next"
              onClick={(e) => scrollToMedia(activeMediaIndex + 1, e)}
              title="Next photo"
            >
              <ChevronRight size={22} strokeWidth={2.4} />
            </button>
          )}


          {/* Play / Pause Interactive Ripple Overlay */}
          {showPlayOverlay && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '74px',
              height: '74px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.9)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-primary)',
              zIndex: 25,
              pointerEvents: 'none',
              animation: 'floatUp 0.3s ease-out'
            }}>
              {isPlaying ? <Play size={32} fill="currentColor" /> : <Pause size={32} fill="currentColor" />}
            </div>
          )}

          {/* Top Left: 4K Ultra HDR Cinematic Badge */}
          <div style={{
            position: 'absolute',
            top: '24px',
            left: '28px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '6px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '11px',
            fontWeight: 800,
            color: 'var(--accent-primary)',
            boxShadow: '0 4px 18px rgba(0, 0, 0, 0.12)',
            zIndex: 20
          }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f43f5e' }} className="live-pulse" />
            <span>OYE PROPERTIES 4K HDR • AERIAL TOUR</span>
          </div>

          {/* Top Right: Soundwave Toggle & Fullscreen Button */}
          <div style={{
            position: 'absolute',
            top: '24px',
            right: '28px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            zIndex: 20
          }}>
            {/* Audio Toggle with Soundwave Animation */}
            <button
              id={`btn-desktop-mute-${property.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onToggleMute();
              }}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: 'var(--radius-full)',
                padding: '8px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                color: 'var(--accent-primary)',
                fontSize: '12px',
                fontWeight: 700,
                boxShadow: '0 4px 20px rgba(11, 28, 61, 0.15)'
              }}
              title="Toggle Cinematic Audio"
            >
              {isMuted ? (
                <>
                  <VolumeX size={16} />
                  <span>Audio Muted</span>
                </>
              ) : (
                <>
                  <Volume2 size={16} color="#2563eb" />
                  <div style={{ display: 'flex', alignItems: 'center', gap: '2px', height: '14px' }}>
                    <div className="soundwave-bar" />
                    <div className="soundwave-bar" />
                    <div className="soundwave-bar" />
                  </div>
                  <span>Sound Active</span>
                </>
              )}
            </button>

            {/* Native Fullscreen Expand Button */}
            <button
              id={`btn-desktop-fullscreen-${property.id}`}
              onClick={handleFullscreenVideo}
              style={{
                background: '#ffffff',
                border: '1px solid var(--border-subtle)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'var(--accent-primary)',
                boxShadow: '0 4px 16px rgba(11, 28, 61, 0.12)'
              }}
              title="Full Video Mode"
            >
              <Maximize size={15} />
            </button>
          </div>

          {/* Bottom Floating Hint */}
          <div style={{
            position: 'absolute',
            bottom: '24px',
            left: '28px',
            color: 'rgba(255, 255, 255, 0.85)',
            fontSize: '11px',
            fontWeight: 600,
            textShadow: '0 2px 8px rgba(0,0,0,0.6)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            zIndex: 10
          }}>
            <Sparkles size={13} />
            <span>Click Video to Pause/Play • Press ← → Arrow Keys to Slide</span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MOBILE VERTICAL REEL FORMAT (9:16 Viewport)
  // ==========================================
  return (
    <div className="reel-slide reel-card" id={`reel-slide-${property.id}`}>
      <div className="reel-mobile-view">
        {/* Horizontal Carousel Container (Sideways swipe to check property images) */}
        <div 
          ref={carouselRef}
          className="reel-media-carousel"
          onScroll={handleCarouselScroll}
        >
          {mediaItems.map((item, idx) => (
            <div key={item.id} className="reel-media-slide">
              {item.type === 'video' ? (
                <video
                  ref={videoRef}
                  className="reel-video"
                  src={item.src}
                  poster={item.poster}
                  loop
                  muted={isMuted}
                  playsInline
                  onClick={handleTogglePlay}
                />
              ) : (
                <img
                  src={item.src}
                  alt={`${property.title} - View ${idx}`}
                  className="reel-carousel-image"
                  loading={idx < 2 ? 'eager' : 'lazy'}
                  onClick={handleTogglePlay}
                />
              )}
            </div>
          ))}
        </div>

        <div className="reel-gradient-overlay" />

        {/* Carousel Story Indicator Dots & Media Counter (Instagram style) */}
        {mediaItems.length > 1 && (
          <div className="reel-carousel-indicator-wrap">
            <div className="reel-carousel-dots">
              {mediaItems.map((_, i) => (
                <button
                  key={`m-dot-${i}`}
                  type="button"
                  onClick={(e) => scrollToMedia(i, e)}
                  className={`reel-carousel-dot ${i === activeMediaIndex ? 'active' : ''}`}
                  title={`View item ${i + 1}`}
                />
              ))}
            </div>
            <div className="reel-carousel-counter-badge">
              {activeMediaIndex === 0 && mediaItems[0].type === 'video' ? (
                <>
                  <Play size={10} fill="#ffffff" />
                  <span>Video 1/{mediaItems.length}</span>
                </>
              ) : (
                <>
                  <Images size={11} />
                  <span>Photo {activeMediaIndex + 1}/{mediaItems.length}</span>
                </>
              )}
            </div>
          </div>
        )}

        {/* Floating Left Chevron Arrow (Tap to go to previous media) */}
        {mediaItems.length > 1 && activeMediaIndex > 0 && (
          <button
            type="button"
            className="reel-media-nav-btn prev"
            onClick={(e) => scrollToMedia(activeMediaIndex - 1, e)}
            title="Previous photo"
          >
            <ChevronLeft size={22} strokeWidth={2.4} />
          </button>
        )}

        {/* Floating Right Chevron Arrow (Tap to go to next media) */}
        {mediaItems.length > 1 && activeMediaIndex < mediaItems.length - 1 && (
          <button
            type="button"
            className="reel-media-nav-btn next"
            onClick={(e) => scrollToMedia(activeMediaIndex + 1, e)}
            title="Next photo"
          >
            <ChevronRight size={22} strokeWidth={2.4} />
          </button>
        )}


        {/* Top Badges: Location & Verification (Positioned neatly beneath top sub-navbar) */}
        <div style={{
          position: 'absolute',
          top: '12px',
          left: '14px',
          right: '14px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
          pointerEvents: 'none'
        }}>
          <div style={{
            background: 'rgba(0, 0, 0, 0.55)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            padding: '5px 12px',
            borderRadius: 'var(--radius-full)',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '11px',
            color: '#ffffff',
            fontWeight: 700,
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
            pointerEvents: 'auto'
          }}>
            <MapPin size={12} color="#38bdf8" />
            <span>{property.location.locality}, {property.location.city}</span>
          </div>

          {property.isOwnerListing ? (
            <div style={{
              background: 'rgba(30, 58, 138, 0.75)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(147, 197, 253, 0.4)',
              color: '#dbeafe',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '10.5px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
              pointerEvents: 'auto'
            }}>
              <CheckCircle2 size={11} />
              Owner Listed
            </div>
          ) : (
            <div style={{
              background: 'rgba(6, 78, 59, 0.75)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              border: '1px solid rgba(110, 231, 183, 0.4)',
              color: '#d1fae5',
              padding: '4px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: '10.5px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
              pointerEvents: 'auto'
            }}>
              <ShieldCheck size={11} />
              Verified Estate
            </div>
          )}
        </div>

        {/* Heart Burst Animation */}
        {showHeartBurst && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            zIndex: 25,
            pointerEvents: 'none'
          }}>
            <Heart 
              size={110} 
              color="#f43f5e" 
              fill="#f43f5e" 
              className="heart-animated"
              style={{ filter: 'drop-shadow(0 0 25px rgba(244, 63, 94, 0.8))' }}
            />
          </div>
        )}

        {/* Right Floating Action Column (No White BG, Filled Visible Icons) */}
        <div className="reel-actions-column">
          {/* Wishlist Heart Button */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button
              id={`btn-reel-heart-${property.id}`}
              onClick={handleLike}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Add to Wishlist"
            >
              <Heart 
                size={32} 
                fill={isWishlisted ? '#f43f5e' : 'rgba(255, 255, 255, 0.95)'} 
                color={isWishlisted ? '#f43f5e' : '#ffffff'}
                style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.8))' }}
              />
            </button>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.9)', marginTop: '1px' }}>
              {likesCount > 999 ? (likesCount / 1000).toFixed(1) + 'k' : likesCount}
            </span>
          </div>

          {/* WhatsApp Share Button (Filled Vibrant Green) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button
              id={`btn-reel-whatsapp-${property.id}`}
              onClick={handleShareWhatsApp}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px'
              }}
              title="Share Estate on WhatsApp"
            >
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#22c55e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(0,0,0,0.45)'
              }}>
                <MessageCircle size={22} color="#ffffff" fill="#ffffff" />
              </div>
            </button>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.9)', marginTop: '1px' }}>
              WhatsApp
            </span>
          </div>

          {/* Know More Specs Button (Filled Sapphire Blue) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button
              id={`btn-reel-know-more-${property.id}`}
              onClick={() => onOpenDetail(property)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px'
              }}
              title="Deep Specs & EMI"
            >
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: '#0b1c3d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(0,0,0,0.55)',
                border: '1.5px solid rgba(255,255,255,0.18)'
              }}>
                <Info size={22} color="#ffffff" strokeWidth={2.4} />
              </div>
            </button>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.9)', marginTop: '1px' }}>
              Specs
            </span>
          </div>

          {/* Call Back Button (Filled Royal Navy) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button
              id={`btn-reel-callback-${property.id}`}
              onClick={() => onOpenCallback(property)}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px'
              }}
              title="Get a Call Back"
            >
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: 'var(--accent-primary)',
                border: '1.5px solid rgba(255,255,255,0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 14px rgba(0,0,0,0.45)'
              }}>
                <PhoneCall size={19} color="#ffffff" strokeWidth={2.4} />
              </div>
            </button>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.9)', marginTop: '1px' }}>
              Call
            </span>
          </div>

          {/* Sound Toggle (Translucent Dark Glass) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <button
              id="btn-reel-sound-toggle"
              onClick={(e) => {
                e.stopPropagation();
                onToggleMute();
              }}
              style={{
                background: 'transparent',
                border: 'none',
                cursor: 'pointer',
                padding: '4px'
              }}
              title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            >
              <div style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: 'rgba(0,0,0,0.5)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
              }}>
                {isMuted ? <VolumeX size={18} color="#ffffff" /> : <Volume2 size={18} color="#38bdf8" />}
              </div>
            </button>
            <span style={{ fontSize: '10px', fontWeight: 800, color: '#ffffff', textShadow: '0 1px 4px rgba(0,0,0,0.9)', marginTop: '1px' }}>
              {isMuted ? 'Muted' : 'Audio'}
            </span>
          </div>
        </div>

        {/* Reel Bottom Meta Overlay: Transparent & Positioned snug above mobile bottom bar */}
        <div style={{
          position: 'absolute',
          bottom: '14px',
          left: '12px',
          right: '70px',
          zIndex: 15,
          color: '#ffffff',
          pointerEvents: 'auto'
        }}>
          {/* Price Header with EMI Tag */}
          <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '6px', marginBottom: '2px' }}>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '24px',
              fontWeight: 900,
              color: '#ffffff',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 8px rgba(0,0,0,0.95)'
            }}>
              {property.priceFormatted}
            </span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.9)', fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,0.85)' }}>
              ({property.pricePerSqFt})
            </span>
            <span style={{
              fontSize: '10px',
              color: '#38bdf8',
              background: 'rgba(0,0,0,0.55)',
              backdropFilter: 'blur(6px)',
              border: '1px solid rgba(255,255,255,0.25)',
              padding: '2px 6px',
              borderRadius: '4px',
              fontWeight: 700
            }}>
              EMI ~₹{estMonthlyEmi}L/mo*
            </span>
          </div>

          {/* Property Title */}
          <h2 style={{
            fontSize: '16px',
            fontWeight: 800,
            color: '#ffffff',
            lineHeight: 1.2,
            marginBottom: '3px',
            textShadow: '0 2px 8px rgba(0,0,0,0.95)'
          }}>
            {property.title}
          </h2>
          
          {/* Compact Tagline (1 Line Ellipsis) */}
          <p style={{
            fontSize: '11px',
            color: 'rgba(255,255,255,0.9)',
            lineHeight: 1.3,
            marginBottom: '8px',
            display: '-webkit-box',
            WebkitLineClamp: 1,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            textShadow: '0 1px 4px rgba(0,0,0,0.85)'
          }}>
            {property.tagline}
          </p>

          {/* Spec Badges Row (Translucent Glass Badges) */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap', marginBottom: '10px' }}>
            <span style={{
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <BedDouble size={12} color="#38bdf8" />
              {property.bhk} BHK
            </span>

            <span style={{
              background: 'rgba(0,0,0,0.5)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <Maximize2 size={12} color="#38bdf8" />
              {property.areaSqFt.toLocaleString()} sq.ft
            </span>

            <span style={{
              background: 'rgba(37,99,235,0.65)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.3)',
              color: '#ffffff',
              padding: '2px 8px',
              borderRadius: '6px',
              fontSize: '10px',
              fontWeight: 700
            }}>
              {property.status}
            </span>

            {/* Direction Facing Badge */}
            {property.facing && (
              <span style={{
                background: 'rgba(180, 83, 9, 0.6)',
                backdropFilter: 'blur(8px)',
                border: '1px solid rgba(255,255,255,0.25)',
                color: '#ffffff',
                padding: '2px 8px',
                borderRadius: '6px',
                fontSize: '10px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '3px'
              }}>
                <Compass size={10} />
                {property.facing}
              </span>
            )}
          </div>

          {/* Quick Dual Action Buttons */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              id={`btn-bottom-knowmore-${property.id}`}
              onClick={() => onOpenDetail(property)}
              style={{
                flex: 1,
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                padding: '7px 12px',
                background: 'rgba(255, 255, 255, 0.2)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255, 255, 255, 0.4)',
                borderRadius: 'var(--radius-full)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
              }}
            >
              <Info size={13} />
              <span>Specs & Tour</span>
            </button>

            <button
              id={`btn-bottom-callback-${property.id}`}
              onClick={() => onOpenCallback(property)}
              style={{
                flex: 1,
                justifyContent: 'center',
                fontSize: '11px',
                fontWeight: 700,
                padding: '7px 12px',
                background: 'var(--accent-primary)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: 'var(--radius-full)',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(0,0,0,0.4)'
              }}
            >
              <PhoneCall size={13} />
              <span>Call Back</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
