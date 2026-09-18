import React, { useState } from 'react';
import {
  Zap,
  LayoutGrid,
  MapPin,
  Heart,
  Sparkles,
  ChevronDown,
  PlusCircle,
  User,
  RotateCw,
  LogOut,
  CheckCircle2,
  CalendarCheck
} from 'lucide-react';
import OyeLogo from './OyeLogo';

const NAV_LINK_STYLE = {
  background: 'transparent',
  border: 'none',
  color: '#555555',
  fontSize: '13.5px',
  fontWeight: 500,
  fontFamily: "'Poppins', sans-serif",
  padding: '8px 12px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '4px',
  position: 'relative',
  transition: 'color 0.18s ease',
  letterSpacing: '0.01em',
  whiteSpace: 'nowrap',
};

const DROPDOWN_ITEM_STYLE = {
  padding: '9px 12px',
  borderRadius: '8px',
  fontSize: '13px',
  fontWeight: 500,
  fontFamily: "'Poppins', sans-serif",
  color: '#555555',
  background: 'transparent',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  transition: 'all 0.15s ease',
};

export default function Navbar({
  currentCity,
  onSelectCity,
  onOpenLocationModal,
  viewMode,
  setViewMode,
  wishlistCount,
  onOpenWishlist,
  onOpenAISearch,
  onOpenListProperty,
  currentUser,
  onOpenAuth,
  onLogout,
  onDetectGPS,
  isDetectingGPS
}) {
  const [exploreOpen, setExploreOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const cities = ['All Cities', 'Mumbai', 'Delhi NCR', 'Dubai', 'Goa', 'Bangalore', 'Hyderabad'];

  return (
    <header className="navbar-header">
      {/* ─── LEFT: Logo + Nav Links ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '24px', minWidth: 0 }}>

        {/* Logo */}
        <div onClick={() => setViewMode('reels')} style={{ cursor: 'pointer', flexShrink: 0 }}>
          <OyeLogo />
        </div>

        {/* Desktop Nav Links */}
        <nav className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>

          {/* Markets dropdown */}
          <div
            style={{ position: 'relative' }}
            onMouseEnter={() => setExploreOpen(true)}
            onMouseLeave={() => setExploreOpen(false)}
          >
            <button
              style={NAV_LINK_STYLE}
              onMouseEnter={e => e.currentTarget.style.color = '#E71D2B'}
              onMouseLeave={e => e.currentTarget.style.color = '#555555'}
            >
              Markets <ChevronDown size={13} />
            </button>
            {exploreOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                width: '220px',
                background: '#ffffff',
                border: '1px solid #EDEDED',
                borderRadius: '14px',
                boxShadow: '0 12px 40px rgba(0,0,0,0.10)',
                padding: '10px',
                zIndex: 60,
              }}>
                <div style={{ fontSize: '10px', fontWeight: 600, color: '#999', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '6px', padding: '0 6px' }}>
                  Select City
                </div>
                {cities.map(c => (
                  <div
                    key={c}
                    onClick={() => { onSelectCity(c === 'All Cities' ? 'all' : c); setExploreOpen(false); }}
                    style={{
                      ...DROPDOWN_ITEM_STYLE,
                      color: (currentCity === c || (c === 'All Cities' && currentCity === 'all')) ? '#E71D2B' : '#555555',
                      fontWeight: (currentCity === c || (c === 'All Cities' && currentCity === 'all')) ? 600 : 500,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#FFF0F1'; e.currentTarget.style.color = '#E71D2B'; }}
                    onMouseLeave={e => {
                      const isActive = currentCity === c || (c === 'All Cities' && currentCity === 'all');
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = isActive ? '#E71D2B' : '#555555';
                    }}
                  >
                    <span>{c}</span>
                    {(currentCity === c || (c === 'All Cities' && currentCity === 'all')) && (
                      <CheckCircle2 size={13} color="#E71D2B" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Instants link */}
          <button
            id="view-mode-reels"
            onClick={() => setViewMode('reels')}
            style={{
              ...NAV_LINK_STYLE,
              color: viewMode === 'reels' ? '#E71D2B' : '#555555',
              fontWeight: viewMode === 'reels' ? 600 : 500,
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#E71D2B'}
            onMouseLeave={e => { if (viewMode !== 'reels') e.currentTarget.style.color = '#555555'; }}
          >
            <Zap size={14} />
            Instants
          </button>

          {/* Catalogue link */}
          <button
            id="view-mode-catalogue"
            onClick={() => setViewMode('catalogue')}
            style={{
              ...NAV_LINK_STYLE,
              color: viewMode === 'catalogue' ? '#E71D2B' : '#555555',
              fontWeight: viewMode === 'catalogue' ? 600 : 500,
            }}
            onMouseEnter={e => e.currentTarget.style.color = '#E71D2B'}
            onMouseLeave={e => { if (viewMode !== 'catalogue') e.currentTarget.style.color = '#555555'; }}
          >
            <LayoutGrid size={14} />
            Catalogue
          </button>

          <button
            style={NAV_LINK_STYLE}
            onMouseEnter={e => e.currentTarget.style.color = '#E71D2B'}
            onMouseLeave={e => e.currentTarget.style.color = '#555555'}
          >
            <CalendarCheck size={14} />
            Book Visit
          </button>
        </nav>
      </div>

      {/* ─── RIGHT: Actions Cluster ─── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>

        {/* Mobile City Badge */}
        <button
          onClick={onOpenLocationModal}
          className="hidden-desktop"
          style={{
            background: '#F5F5F5',
            border: '1px solid #EDEDED',
            borderRadius: '9999px',
            height: '34px',
            padding: '0 10px',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '11px',
            fontWeight: 500,
            fontFamily: "'Poppins', sans-serif",
            color: '#1F1F1F',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
          title="Change City"
        >
          <MapPin size={11} color="#E71D2B" />
          <span style={{ maxWidth: '65px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentCity === 'all' ? 'All' : currentCity || 'Mumbai'}
          </span>
        </button>

        {/* Desktop City Pill */}
        <button
          onClick={onOpenLocationModal}
          className="hidden-mobile"
          style={{
            background: '#F5F5F5',
            border: '1px solid #EDEDED',
            borderRadius: '9999px',
            height: '34px',
            padding: '0 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12.5px',
            fontWeight: 500,
            fontFamily: "'Poppins', sans-serif",
            color: '#1F1F1F',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#FFF0F1'; e.currentTarget.style.borderColor = '#E71D2B'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#F5F5F5'; e.currentTarget.style.borderColor = '#EDEDED'; }}
          title="Change City"
        >
          <MapPin size={12} color="#E71D2B" />
          {currentCity === 'all' ? 'All Cities' : currentCity || 'Mumbai'}
          <button
            onClick={e => { e.stopPropagation(); onDetectGPS(); }}
            disabled={isDetectingGPS}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: '0',
              display: 'flex',
              color: '#999',
              marginLeft: '2px',
            }}
            title="Detect GPS"
          >
            <RotateCw size={11} className={isDetectingGPS ? 'animate-spin' : ''} />
          </button>
        </button>

        {/* AI Vibe Search (Desktop) */}
        <button
          id="btn-ai-search-trigger"
          onClick={onOpenAISearch}
          className="hidden-mobile"
          style={{
            background: '#F5F5F5',
            border: '1px solid #EDEDED',
            borderRadius: '9999px',
            height: '34px',
            padding: '0 14px',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '12.5px',
            fontWeight: 500,
            fontFamily: "'Poppins', sans-serif",
            color: '#555555',
            cursor: 'pointer',
            flexShrink: 0,
            transition: 'all 0.18s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#FFF0F1'; e.currentTarget.style.borderColor = '#E71D2B'; e.currentTarget.style.color = '#E71D2B'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#F5F5F5'; e.currentTarget.style.borderColor = '#EDEDED'; e.currentTarget.style.color = '#555555'; }}
        >
          <Sparkles size={13} color="#E71D2B" />
          AI Search
        </button>

        {/* Wishlist (Desktop) */}
        <button
          id="btn-wishlist-trigger"
          onClick={onOpenWishlist}
          className="hidden-mobile"
          style={{
            background: wishlistCount > 0 ? '#FFF0F1' : '#F5F5F5',
            color: wishlistCount > 0 ? '#E71D2B' : '#555555',
            border: wishlistCount > 0 ? '1px solid rgba(231,29,43,0.25)' : '1px solid #EDEDED',
            borderRadius: '9999px',
            padding: '0 14px',
            height: '34px',
            fontSize: '12.5px',
            fontWeight: 500,
            fontFamily: "'Poppins', sans-serif",
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            transition: 'all 0.18s ease',
          }}
        >
          <Heart size={13} fill={wishlistCount > 0 ? 'currentColor' : 'none'} />
          Saved
          {wishlistCount > 0 && (
            <span style={{
              background: '#E71D2B',
              color: '#fff',
              fontSize: '10px',
              fontWeight: 700,
              minWidth: '18px',
              height: '18px',
              borderRadius: '99px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
            }}>
              {wishlistCount}
            </span>
          )}
        </button>

        {/* List Property CTA (Desktop) */}
        <button
          id="btn-navbar-list-property"
          onClick={onOpenListProperty}
          className="btn-primary hidden-mobile"
          style={{ fontSize: '12.5px', padding: '8px 16px', fontWeight: 600 }}
        >
          <PlusCircle size={14} />
          List Property
        </button>

        {/* Profile / Auth (Desktop) */}
        <div style={{ position: 'relative' }} className="hidden-mobile">
          {currentUser ? (
            <div>
              <button
                onClick={() => setProfileMenuOpen(!profileMenuOpen)}
                style={{
                  background: '#F5F5F5',
                  border: '1px solid #EDEDED',
                  borderRadius: '9999px',
                  padding: '3px 12px 3px 3px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  cursor: 'pointer',
                  transition: 'all 0.18s ease',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#E71D2B'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#EDEDED'; }}
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#1F1F1F', lineHeight: 1.1, fontFamily: "'Poppins', sans-serif" }}>
                    {currentUser.name}
                  </div>
                  <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 500, fontFamily: "'Poppins', sans-serif" }}>
                    {currentUser.role}
                  </div>
                </div>
                <ChevronDown size={12} color="#999" />
              </button>

              {profileMenuOpen && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  right: 0,
                  width: '190px',
                  background: '#ffffff',
                  border: '1px solid #EDEDED',
                  borderRadius: '14px',
                  boxShadow: '0 12px 40px rgba(0,0,0,0.10)',
                  padding: '8px',
                  marginTop: '6px',
                  zIndex: 60,
                }}>
                  <div
                    onClick={() => { onOpenListProperty(); setProfileMenuOpen(false); }}
                    style={{ ...DROPDOWN_ITEM_STYLE, color: '#1F1F1F' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#F5F5F5'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    + Add New Property
                  </div>
                  <div style={{ height: '1px', background: '#EDEDED', margin: '4px 0' }} />
                  <div
                    onClick={() => { onLogout(); setProfileMenuOpen(false); }}
                    style={{ ...DROPDOWN_ITEM_STYLE, color: '#E71D2B' }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#FFF0F1'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                  >
                    <LogOut size={13} />
                    Sign Out
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              id="btn-navbar-auth"
              onClick={onOpenAuth}
              style={{
                background: '#ffffff',
                color: '#E71D2B',
                border: '1.5px solid #E71D2B',
                borderRadius: '9999px',
                padding: '7px 16px',
                fontSize: '12.5px',
                fontWeight: 500,
                fontFamily: "'Poppins', sans-serif",
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.18s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = '#E71D2B'; e.currentTarget.style.color = '#ffffff'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#E71D2B'; }}
            >
              <User size={13} />
              Sign In
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
