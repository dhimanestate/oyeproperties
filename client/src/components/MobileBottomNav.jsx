import React from 'react';
import { Zap, LayoutGrid, Plus, Heart, User } from 'lucide-react';

const OYE_RED = '#E71D2B';

export default function MobileBottomNav({
  viewMode,
  setViewMode,
  onOpenListProperty,
  wishlistCount,
  onOpenWishlist,
  currentUser,
  onOpenAuth
}) {
  const tabStyle = (active) => ({
    background: 'transparent',
    border: 'none',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    color: active ? OYE_RED : '#AAAAAA',
    cursor: 'pointer',
    padding: '6px 8px',
    transition: 'color 0.18s ease',
    fontFamily: "'Poppins', sans-serif",
  });

  const labelStyle = (active) => ({
    fontSize: '10px',
    fontWeight: active ? 600 : 400,
    fontFamily: "'Poppins', sans-serif",
    letterSpacing: '0.01em',
  });

  return (
    <nav className="mobile-bottom-nav-bar">
      {/* 1. Instants */}
      <button
        onClick={() => setViewMode('reels')}
        style={tabStyle(viewMode === 'reels')}
      >
        <Zap size={20} strokeWidth={viewMode === 'reels' ? 2.5 : 1.8} />
        <span style={labelStyle(viewMode === 'reels')}>Instants</span>
      </button>

      {/* 2. Catalogue */}
      <button
        onClick={() => setViewMode('catalogue')}
        style={tabStyle(viewMode === 'catalogue')}
      >
        <LayoutGrid size={20} strokeWidth={viewMode === 'catalogue' ? 2.5 : 1.8} />
        <span style={labelStyle(viewMode === 'catalogue')}>Catalogue</span>
      </button>

      {/* 3. List Property (Center FAB) */}
      <button
        onClick={onOpenListProperty}
        style={{
          background: OYE_RED,
          color: '#ffffff',
          border: '2.5px solid #ffffff',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          boxShadow: '0 4px 18px rgba(231, 29, 43, 0.38)',
          transform: 'translateY(-14px)',
          padding: 0,
          margin: 0,
          transition: 'transform 0.2s ease, box-shadow 0.2s ease',
          flexShrink: 0,
        }}
        title="List Inventory"
      >
        <Plus size={24} strokeWidth={2.6} />
      </button>

      {/* 4. Saved */}
      <button
        onClick={onOpenWishlist}
        style={{ ...tabStyle(false), position: 'relative' }}
      >
        <Heart
          size={20}
          strokeWidth={1.8}
          fill={wishlistCount > 0 ? OYE_RED : 'none'}
          color={wishlistCount > 0 ? OYE_RED : '#AAAAAA'}
        />
        {wishlistCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '2px',
            right: '4px',
            background: OYE_RED,
            color: '#fff',
            fontSize: '9px',
            fontWeight: 700,
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {wishlistCount}
          </span>
        )}
        <span style={labelStyle(false)}>Saved</span>
      </button>

      {/* 5. Profile */}
      <button
        onClick={onOpenAuth}
        style={tabStyle(!!currentUser)}
      >
        <User size={20} strokeWidth={currentUser ? 2.4 : 1.8} />
        <span style={labelStyle(!!currentUser)}>
          {currentUser ? 'Profile' : 'Sign In'}
        </span>
      </button>
    </nav>
  );
}
