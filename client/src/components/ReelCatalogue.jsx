import React, { useState, useEffect, useRef } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Zap, 
  Search, 
  X, 
  LayoutGrid, 
  Compass,
  ArrowRight
} from 'lucide-react';
import ReelItem from './ReelItem';

export default function ReelCatalogue({
  reels,
  loading = false,
  currentCity,
  onSelectCity,
  wishlist,
  onToggleWishlist,
  onOpenDetail,
  onOpenCallback,
  onSwitchToCatalogue,
  searchQuery = '',
  onResetSearch
}) {
  const containerRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isMobile, setIsMobile] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  // Detect Mobile vs Desktop Screen Breakpoint
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Filter Instants dynamically by search query (locality, address, city, title, bhk, type)
  const filteredReels = reels.filter(prop => {
    if (!searchQuery || !searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    const title = (prop.title || '').toLowerCase();
    const locality = (prop.location?.locality || '').toLowerCase();
    const address = (prop.location?.address || '').toLowerCase();
    const city = (prop.location?.city || '').toLowerCase();
    const bhk = `${prop.bhk || ''} bhk`;
    const type = (prop.propertyType || '').toLowerCase();
    return (
      locality.includes(q) ||
      address.includes(q) ||
      city.includes(q) ||
      title.includes(q) ||
      bhk.includes(q) ||
      type.includes(q)
    );
  });

  // Reset active index when search changes
  useEffect(() => {
    setActiveIndex(0);
    if (containerRef.current) {
      if (isMobile) {
        containerRef.current.scrollTop = 0;
      } else {
        containerRef.current.scrollLeft = 0;
      }
    }
  }, [searchQuery]);

  // Sync Active Slide via Intersection Observer
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const slides = container.querySelectorAll('.reel-slide');
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.5) {
            const index = Array.from(slides).indexOf(entry.target);
            if (index !== -1) {
              setActiveIndex(index);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.5
      }
    );

    slides.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [filteredReels, isMobile]);

  // Robust Scroll To Index Helper
  const scrollToIndex = (index) => {
    if (!containerRef.current || index < 0 || index >= filteredReels.length) return;
    const container = containerRef.current;
    const slides = container.querySelectorAll('.reel-slide');
    const targetSlide = slides[index];
    if (targetSlide) {
      if (isMobile) {
        container.scrollTo({
          top: targetSlide.offsetTop,
          behavior: 'smooth'
        });
      } else {
        container.scrollTo({
          left: targetSlide.offsetLeft,
          behavior: 'smooth'
        });
      }
      setActiveIndex(index);
    }
  };

  const scrollNext = () => {
    if (activeIndex < filteredReels.length - 1) {
      scrollToIndex(activeIndex + 1);
    }
  };

  const scrollPrev = () => {
    if (activeIndex > 0) {
      scrollToIndex(activeIndex - 1);
    }
  };

  // Keyboard Navigation: Arrow Keys
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Don't intercept if user is inside an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement?.tagName)) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        scrollNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        scrollPrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex, filteredReels.length, isMobile]);

  // Mouse Wheel / Trackpad sideways navigation on Desktop
  useEffect(() => {
    if (isMobile) return;
    const container = containerRef.current;
    if (!container) return;

    let isScrolling = false;
    let wheelTimeout = null;

    const handleWheel = (e) => {
      // Ignore if user is hovering inside the scrollable master info panel or search input
      if (e.target.closest('.reel-desktop-info-panel') || e.target.closest('input')) return;

      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 25) return;

      if (!isScrolling) {
        if (delta > 0) {
          scrollNext();
        } else {
          scrollPrev();
        }
        isScrolling = true;
        clearTimeout(wheelTimeout);
        wheelTimeout = setTimeout(() => {
          isScrolling = false;
        }, 400);
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      container.removeEventListener('wheel', handleWheel);
      clearTimeout(wheelTimeout);
    };
  }, [activeIndex, filteredReels.length, isMobile]);

  // Touch Swipe Gesture Support
  const touchStartPos = useRef({ x: 0, y: 0 });

  const handleTouchStart = (e) => {
    touchStartPos.current = {
      x: e.touches[0].clientX,
      y: e.touches[0].clientY
    };
  };

  const handleTouchEnd = (e) => {
    const deltaX = e.changedTouches[0].clientX - touchStartPos.current.x;
    const deltaY = e.changedTouches[0].clientY - touchStartPos.current.y;

    if (!isMobile) {
      if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
          scrollNext();
        } else {
          scrollPrev();
        }
      }
    }
  };

  const nextProperty = activeIndex < filteredReels.length - 1 ? filteredReels[activeIndex + 1] : null;

  return (
    <div className="reels-wrapper">
      {/* Main Instants Slider / Viewport Container */}
      <div 
        ref={containerRef} 
        className="reels-main-container"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {loading ? (
          <div className="reel-slide" style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            background: isMobile ? '#0a0a0a' : '#f8f9fa'
          }}>
            {/* Shimmer Preloader Canvas */}
            <div style={{
              width: isMobile ? '100%' : '90%',
              maxWidth: '1200px',
              height: isMobile ? '100%' : '85%',
              borderRadius: isMobile ? '0' : '20px',
              overflow: 'hidden',
              position: 'relative',
              boxShadow: isMobile ? 'none' : '0 20px 50px rgba(0,0,0,0.15)',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              background: '#1a1a1a'
            }}>
              {!isMobile && (
                <div style={{
                  width: '38%',
                  background: '#ffffff',
                  padding: '36px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ width: '120px', height: '26px', background: '#F1F3F5', borderRadius: '999px' }} className="media-preloader" />
                    <div style={{ width: '90%', height: '32px', background: '#F1F3F5', borderRadius: '8px' }} className="media-preloader" />
                    <div style={{ width: '60%', height: '24px', background: '#F1F3F5', borderRadius: '8px' }} className="media-preloader" />
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '16px' }}>
                      <div style={{ height: '56px', background: '#F8F9FA', borderRadius: '10px' }} className="media-preloader" />
                      <div style={{ height: '56px', background: '#F8F9FA', borderRadius: '10px' }} className="media-preloader" />
                    </div>
                  </div>
                  <div style={{ height: '48px', width: '100%', background: '#FFF0F1', borderRadius: '999px' }} className="media-preloader" />
                </div>
              )}
              <div style={{
                flex: 1,
                position: 'relative',
                background: '#111827',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <div className="media-preloader" style={{ background: 'linear-gradient(90deg, #18181b 25%, #27272a 50%, #18181b 75%)' }}>
                  <div style={{ textAlign: 'center', zIndex: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                    <div className="media-preloader-spinner" style={{ width: '38px', height: '38px', borderWidth: '3px' }} />
                    <div style={{ color: '#fff', fontSize: '13px', fontWeight: 600, letterSpacing: '0.02em', textShadow: '0 2px 8px rgba(0,0,0,0.8)' }}>
                      Loading Instants Reel Showcase...
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : filteredReels.length === 0 ? (
          <div style={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--text-secondary)',
            padding: '24px',
            textAlign: 'center',
            background: '#ffffff'
          }}>
            <Zap size={44} color="var(--accent-primary)" style={{ marginBottom: '16px' }} />
            <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px', fontSize: '20px', fontWeight: 800 }}>
              {searchQuery ? `No Instants Found in "${searchQuery}"` : 'No Instants in this Region'}
            </h3>
            <p style={{ fontSize: '13px', marginBottom: '20px', maxWidth: '420px', lineHeight: 1.5 }}>
              {searchQuery 
                ? 'Try searching by other prime areas like Worli, Bandra, DLF Phase 5, Palm Jumeirah, or Goa.'
                : 'Browse all prime properties in Mumbai, Delhi NCR, Dubai, and Goa.'
              }
            </p>
            {searchQuery ? (
              <button onClick={() => setSearchQuery('')} className="btn-primary">
                Clear Search Filter
              </button>
            ) : (
              <button onClick={() => onSelectCity('all')} className="btn-primary">
                Browse All Instants
              </button>
            )}
          </div>
        ) : (
          filteredReels.map((prop, idx) => (
            <ReelItem
              key={prop.id}
              property={prop}
              isActive={idx === activeIndex}
              isMuted={isMuted}
              onToggleMute={() => setIsMuted(!isMuted)}
              isWishlisted={wishlist.some(item => item.id === prop.id)}
              onToggleWishlist={onToggleWishlist}
              onOpenDetail={onOpenDetail}
              onOpenCallback={onOpenCallback}
              isMobile={isMobile}
            />
          ))
        )}
      </div>

      {/* Desktop Horizontal Floating Arrow: Previous */}
      {!isMobile && filteredReels.length > 1 && (
        <button
          id="btn-reel-slider-prev"
          className="slider-arrow-btn prev"
          onClick={scrollPrev}
          disabled={activeIndex === 0}
          title="Previous Luxury Estate (Arrow Left)"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>
      )}

      {/* Desktop Horizontal Floating Arrow: Next */}
      {!isMobile && filteredReels.length > 1 && (
        <button
          id="btn-reel-slider-next"
          className="slider-arrow-btn next"
          onClick={scrollNext}
          disabled={activeIndex >= filteredReels.length - 1}
          title="Next Luxury Estate (Arrow Right)"
        >
          <ChevronRight size={24} strokeWidth={2.5} />
        </button>
      )}

      {/* Desktop Bottom Slider Dock */}
      {!isMobile && filteredReels.length > 0 && (
        <div className="reels-slider-dock">
          {/* Active Slide Counter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{
              fontFamily: "'Poppins', sans-serif",
              fontSize: '16px',
              fontWeight: 800,
              color: '#0F172A',
              display: 'flex',
              alignItems: 'baseline',
              gap: '4px'
            }}>
              <span style={{ color: '#E71D2B', fontSize: '18px' }}>{String(activeIndex + 1).padStart(2, '0')}</span>
              <span style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 500 }}>/</span>
              <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
                {String(filteredReels.length).padStart(2, '0')}
              </span>
            </div>

            {/* Clickable Progress Bars */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              {filteredReels.map((_, i) => (
                <button
                  key={i}
                  onClick={() => scrollToIndex(i)}
                  style={{
                    height: '5px',
                    width: i === activeIndex ? '32px' : '10px',
                    borderRadius: '9999px',
                    background: i === activeIndex ? '#E71D2B' : '#E2E8F0',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                    boxShadow: i === activeIndex ? '0 2px 8px rgba(231, 29, 43, 0.35)' : 'none'
                  }}
                  title={`Jump to Estate #${i + 1}`}
                />
              ))}
            </div>
          </div>

          {/* Center Next Property Teaser Pill */}
          {nextProperty && (
            <div 
              onClick={scrollNext}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                cursor: 'pointer',
                padding: '5px 14px 5px 8px',
                borderRadius: '9999px',
                background: 'linear-gradient(135deg, #FFF0F1 0%, #FFFFFF 100%)',
                border: '1px solid rgba(231, 29, 43, 0.2)',
                boxShadow: '0 2px 10px rgba(231, 29, 43, 0.06)',
                transition: 'all 0.2s ease',
              }}
              className="next-estate-pill-teaser"
              title="Click to view next property"
            >
              <div style={{
                background: '#E71D2B',
                color: '#ffffff',
                fontSize: '10px',
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: '9999px',
                letterSpacing: '0.04em',
                textTransform: 'uppercase'
              }}>
                Up Next
              </div>
              <span style={{ fontSize: '12.5px', color: '#1E293B', fontWeight: 600, maxWidth: '220px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {nextProperty.title}
              </span>
              <ArrowRight size={14} color="#E71D2B" strokeWidth={2.4} />
            </div>
          )}

          {/* Right: Switch to Catalogue Grid */}
          <button
            onClick={onSwitchToCatalogue}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '7px',
              background: '#FFFFFF',
              border: '1.5px solid #E2E8F0',
              padding: '7px 16px',
              borderRadius: '9999px',
              fontSize: '12px',
              fontWeight: 700,
              color: '#334155',
              cursor: 'pointer',
              fontFamily: "'Poppins', sans-serif",
              transition: 'all 0.2s ease',
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
            }}
            className="dock-grid-btn"
          >
            <LayoutGrid size={14} color="#E71D2B" />
            <span>All Estates ({filteredReels.length})</span>
          </button>
        </div>
      )}
    </div>
  );
}
