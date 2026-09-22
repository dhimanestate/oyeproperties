import React, { useState, useEffect, useCallback } from 'react';

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
  CalendarCheck,
  Bell,
  Shield,
  X
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
  onOpenDashboard,
  onLogout,
  onDetectGPS,
  isDetectingGPS,
  onOpenAdminPanel,
  notifications,
  unreadNotifCount,
  onMarkNotifsRead,
}) {
  const [exploreOpen, setExploreOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const cities = ['All Cities', 'Faridabad', 'Delhi NCR', 'Mumbai', 'Dubai', 'Goa', 'Bangalore', 'Hyderabad'];

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
                zIndex: 1100,
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

        {/* Mobile Admin Portal Button (Visible only to Admin users on Mobile) */}
        {currentUser?.role === 'Admin' && (
          <button
            id="btn-mobile-navbar-admin"
            onClick={onOpenAdminPanel}
            className="hidden-desktop"
            style={{
              background: '#FFF0F1',
              border: '1.5px solid #E71D2B',
              borderRadius: '9999px',
              height: '34px',
              padding: '0 10px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '11.5px',
              fontWeight: 700,
              fontFamily: "'Poppins', sans-serif",
              color: '#E71D2B',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
            title="Open Admin Console"
          >
            <Shield size={13} color="#E71D2B" />
            <span>Admin</span>
          </button>
        )}

        {/* Mobile Profile / Sign In Button */}
        {currentUser ? (
          <button
            id="btn-mobile-navbar-profile"
            onClick={onOpenDashboard}
            className="hidden-desktop"
            style={{
              background: '#F5F5F5',
              border: '1.5px solid #E71D2B',
              borderRadius: '50%',
              width: '34px',
              height: '34px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              padding: 0,
              flexShrink: 0,
              overflow: 'hidden',
            }}
            title="Open Dashboard"
          >
            <img
              src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
              alt={currentUser.name}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </button>
        ) : (
          <button
            id="btn-mobile-navbar-signin"
            onClick={onOpenAuth}
            className="hidden-desktop"
            style={{
              background: '#ffffff',
              color: '#E71D2B',
              border: '1.5px solid #E71D2B',
              borderRadius: '9999px',
              height: '32px',
              padding: '0 10px',
              fontSize: '11px',
              fontWeight: 600,
              fontFamily: "'Poppins', sans-serif",
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
              flexShrink: 0,
            }}
          >
            <User size={12} />
            <span>Sign In</span>
          </button>
        )}

        {/* Desktop City Pill */}
        <div
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
            userSelect: 'none',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#FFF0F1'; e.currentTarget.style.borderColor = '#E71D2B'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#F5F5F5'; e.currentTarget.style.borderColor = '#EDEDED'; }}
          title="Change City"
          role="button"
          tabIndex={0}
          onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') onOpenLocationModal(); }}
        >
          <MapPin size={12} color="#E71D2B" />
          <span>{currentCity === 'all' ? 'All Cities' : currentCity || 'Mumbai'}</span>
          <button
            type="button"
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
        </div>

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

        {/* Notification Bell (Desktop) */}
        {currentUser && (
          <div className="hidden-mobile" style={{ position: 'relative' }}>
            <button
              id="btn-navbar-notifications"
              onClick={() => { setNotifOpen(!notifOpen); if (!notifOpen && onMarkNotifsRead) onMarkNotifsRead(); }}
              style={{
                background: '#F5F5F5',
                border: '1px solid #EDEDED',
                borderRadius: '9999px',
                width: '36px', height: '36px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer',
                position: 'relative',
                transition: 'all 0.18s ease',
                color: '#555555',
              }}
              title="Notifications"
            >
              <Bell size={16} color="#555" />
              {unreadNotifCount > 0 && (
                <span style={{
                  position: 'absolute', top: '-4px', right: '-4px',
                  background: '#E71D2B', color: '#fff',
                  fontSize: '9px', fontWeight: 700,
                  minWidth: '16px', height: '16px',
                  borderRadius: '99px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  padding: '0 3px',
                }}>{unreadNotifCount > 9 ? '9+' : unreadNotifCount}</span>
              )}
            </button>

            {notifOpen && (
              <div style={{
                position: 'absolute', top: '110%', right: 0,
                width: '340px', maxHeight: '440px', overflowY: 'auto',
                background: '#fff', border: '1px solid #EDEDED',
                borderRadius: '16px', boxShadow: '0 16px 48px rgba(0,0,0,0.14)',
                padding: '12px', zIndex: 1100,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px', padding: '0 4px' }}>
                  <div style={{ fontWeight: 700, fontSize: '13px', fontFamily: "'Poppins', sans-serif", color: '#1F1F1F' }}>Notifications</div>
                  <button onClick={() => setNotifOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#999', padding: '2px' }}>
                    <X size={15} />
                  </button>
                </div>
                {(notifications || []).length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#999', padding: '2rem 0', fontFamily: "'Poppins', sans-serif", fontSize: '13px' }}>No notifications yet</div>
                ) : (
                  (notifications || []).slice(0, 20).map((n, i) => (
                    <div key={i} style={{
                      padding: '10px', borderRadius: '10px', marginBottom: '6px',
                      background: n.read ? '#FAFAFA' : '#FFF0F1',
                      border: n.read ? '1px solid #EDEDED' : '1px solid rgba(231,29,43,0.18)',
                    }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#1F1F1F', fontFamily: "'Poppins', sans-serif", marginBottom: '3px' }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#555', fontFamily: "'Poppins', sans-serif", lineHeight: 1.4 }}>{n.message}</div>
                      <div style={{ fontSize: '10px', color: '#999', marginTop: '4px', fontFamily: "'Poppins', sans-serif" }}>
                        {new Date(n.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        )}

        {/* Profile / Auth (Desktop) */}
        <div className="hidden-mobile" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {currentUser ? (
            <>
              <div style={{ position: 'relative' }}>
                <button
                  id="btn-navbar-profile"
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
                    width: '210px',
                    background: '#ffffff',
                    border: '1px solid #EDEDED',
                    borderRadius: '14px',
                    boxShadow: '0 12px 40px rgba(0,0,0,0.12)',
                    padding: '8px',
                    marginTop: '6px',
                    zIndex: 1100,
                  }}>
                    <div
                      id="btn-navbar-dashboard"
                      onClick={() => { onOpenDashboard?.(); setProfileMenuOpen(false); }}
                      style={{ ...DROPDOWN_ITEM_STYLE, color: '#1F1F1F', fontWeight: 600 }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#F5F5F5'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <User size={15} color="#E71D2B" />
                        My Dashboard
                      </span>
                    </div>
                    <div
                      id="btn-navbar-add-prop"
                      onClick={() => { onOpenListProperty(); setProfileMenuOpen(false); }}
                      style={{ ...DROPDOWN_ITEM_STYLE, color: '#1F1F1F' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#F5F5F5'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <PlusCircle size={15} color="#555" />
                        Add New Property
                      </span>
                    </div>
                    {currentUser.role === 'Admin' && (
                      <div
                        id="btn-navbar-admin"
                        onClick={() => { onOpenAdminPanel?.(); setProfileMenuOpen(false); }}
                        style={{ ...DROPDOWN_ITEM_STYLE, color: '#E71D2B', fontWeight: 600 }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#FFF0F1'; }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Shield size={14} color="#E71D2B" />
                          Admin Console
                        </span>
                        <span style={{ background: '#E71D2B', color: '#fff', fontSize: '9px', padding: '2px 6px', borderRadius: '99px', fontWeight: 700 }}>ADMIN</span>
                      </div>
                    )}
                    <div style={{ height: '1px', background: '#EDEDED', margin: '4px 0' }} />
                    <div
                      id="btn-navbar-signout"
                      onClick={() => { onLogout(); setProfileMenuOpen(false); }}
                      style={{ ...DROPDOWN_ITEM_STYLE, color: '#E71D2B' }}
                      onMouseEnter={e => { e.currentTarget.style.background = '#FFF0F1'; }}
                      onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                    >
                      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <LogOut size={15} />
                        Sign Out
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Standalone Direct Logout Button */}
              <button
                id="btn-navbar-direct-logout"
                onClick={onLogout}
                title="Logout of your account"
                style={{
                  background: '#FFF0F1',
                  color: '#E71D2B',
                  border: '1.5px solid #FFD0D4',
                  borderRadius: '9999px',
                  height: '34px',
                  padding: '0 12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  fontFamily: "'Poppins', sans-serif",
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.18s ease',
                  flexShrink: 0,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = '#E71D2B';
                  e.currentTarget.style.color = '#ffffff';
                  e.currentTarget.style.borderColor = '#E71D2B';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = '#FFF0F1';
                  e.currentTarget.style.color = '#E71D2B';
                  e.currentTarget.style.borderColor = '#FFD0D4';
                }}
              >
                <LogOut size={13} />
                <span>Logout</span>
              </button>
            </>
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
