import React, { useState, useEffect, useCallback } from 'react';
import { API_BASE } from './config';
import Navbar from './components/Navbar';
import LocationDetectorModal from './components/LocationDetectorModal';
import ReelCatalogue from './components/ReelCatalogue';
import PropertyGrid from './components/PropertyGrid';
import PropertyDetailModal from './components/PropertyDetailModal';
import CallbackModal from './components/CallbackModal';
import CompareDrawer from './components/CompareDrawer';
import WishlistDrawer from './components/WishlistDrawer';
import AIVibeSearchBar from './components/AIVibeSearchBar';
import AuthModal from './components/AuthModal';
import ListPropertyModal from './components/ListPropertyModal';
import MobileBottomNav from './components/MobileBottomNav';
import TopSearchFilterStrip from './components/TopSearchFilterStrip';
import FilterModal from './components/FilterModal';
import UserDashboard from './components/UserDashboard';
import AdminPanel from './components/admin/AdminPanel';

const TOKEN_KEY = 'oye_auth_token';

export default function App() {
  const [viewMode, setViewMode] = useState('reels'); // 'reels' or 'catalogue'
  const [currentCity, setCurrentCity] = useState('Faridabad');
  const [detectedLocation, setDetectedLocation] = useState(null);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);

  // User Profile & Authentication
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('lumiere_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isListModalOpen, setIsListModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);
  const [authRedirectReason, setAuthRedirectReason] = useState('');

  // Notifications
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);

  // Properties Data
  const [properties, setProperties] = useState([]);
  const [reels, setReels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingReels, setLoadingReels] = useState(true);

  // Filters State
  const [filters, setFilters] = useState({
    search: '',
    purpose: 'all',
    bhk: 'all',
    propertyType: 'all',
    maxPrice: 650000000,
    facing: 'all',
    status: 'all',
    sort: 'popular'
  });

  // Wishlist (Guest LocalStorage Persistence)
  const [wishlist, setWishlist] = useState(() => {
    try {
      const saved = localStorage.getItem('lumiere_guest_wishlist');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Compare properties (up to 3)
  const [comparedProperties, setComparedProperties] = useState([]);

  // Modals
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [isWishlistOpen, setIsWishlistOpen] = useState(false);
  const [isAISearchOpen, setIsAISearchOpen] = useState(false);
  const [activeDetailProperty, setActiveDetailProperty] = useState(null);
  const [activeCallbackProperty, setActiveCallbackProperty] = useState(null);
  const [isExitConfirmOpen, setIsExitConfirmOpen] = useState(false);

  // Step-by-step Hardware / Browser Back Button History Stack & Home Exit Guard
  const isAnyModalOpen = Boolean(
    activeDetailProperty || 
    activeCallbackProperty || 
    isListModalOpen || 
    isFilterModalOpen || 
    isWishlistOpen || 
    isAISearchOpen || 
    isAuthModalOpen || 
    isDashboardOpen || 
    isAdminPanelOpen || 
    isLocationModalOpen
  );

  useEffect(() => {
    if (isAnyModalOpen) {
      window.history.pushState({ modalState: true }, '');
    }
  }, [isAnyModalOpen]);

  useEffect(() => {
    const handlePopState = () => {
      if (isExitConfirmOpen) {
        setIsExitConfirmOpen(false);
        return;
      }

      if (activeDetailProperty) {
        setActiveDetailProperty(null);
      } else if (activeCallbackProperty) {
        setActiveCallbackProperty(null);
      } else if (isListModalOpen) {
        setIsListModalOpen(false);
      } else if (isFilterModalOpen) {
        setIsFilterModalOpen(false);
      } else if (isWishlistOpen) {
        setIsWishlistOpen(false);
      } else if (isAISearchOpen) {
        setIsAISearchOpen(false);
      } else if (isAuthModalOpen) {
        setIsAuthModalOpen(false);
      } else if (isDashboardOpen) {
        setIsDashboardOpen(false);
      } else if (isAdminPanelOpen) {
        setIsAdminPanelOpen(false);
      } else if (isLocationModalOpen) {
        setIsLocationModalOpen(false);
      } else {
        setIsExitConfirmOpen(true);
        window.history.pushState({ homeExitGuard: true }, '');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [
    isExitConfirmOpen,
    activeDetailProperty,
    activeCallbackProperty,
    isListModalOpen,
    isFilterModalOpen,
    isWishlistOpen,
    isAISearchOpen,
    isAuthModalOpen,
    isDashboardOpen,
    isAdminPanelOpen,
    isLocationModalOpen
  ]);

  // Sync wishlist from backend when authenticated
  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (token && currentUser) {
      fetch(`${API_BASE}/api/users/wishlist`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(r => {
          if (r.status === 401) {
            localStorage.removeItem(TOKEN_KEY);
            localStorage.removeItem('lumiere_user');
            setCurrentUser(null);
            return null;
          }
          return r.json();
        })
        .then(data => {
          if (data && data.wishlist && Array.isArray(data.wishlist)) {
            // Respect the authenticated backend wishlist as source of truth
            setWishlist(data.wishlist);
            try {
              localStorage.setItem('lumiere_guest_wishlist', JSON.stringify(data.wishlist));
            } catch (e) {
              console.error(e);
            }
          }
        })
        .catch(() => { /* silent */ });
    }
  }, [currentUser]);

  // Fetch in-app notifications for logged-in user
  const fetchNotifications = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token || !currentUser) return;
    try {
      const r = await fetch(`${API_BASE}/api/users/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });
      if (r.status === 401) {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem('lumiere_user');
        setCurrentUser(null);
        return;
      }
      const data = await r.json();
      if (data.success && Array.isArray(data.notifications)) {
        setNotifications(data.notifications);
        setUnreadNotifCount(data.notifications.filter(n => !n.read).length);
      }
    } catch { /* silent */ }
  }, [currentUser]);

  useEffect(() => {
    fetchNotifications();
    // Poll every 30 seconds for new notifications
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, [fetchNotifications]);

  const handleMarkNotifsRead = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) return;
    try {
      await fetch(`${API_BASE}/api/users/notifications/read`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
      });
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadNotifCount(0);
    } catch { /* silent */ }
  }, []);


  // ── Handle Google OAuth callback token in URL ────────────────────────────────
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const authToken = params.get('auth_token');
    if (authToken) {
      localStorage.setItem(TOKEN_KEY, authToken);
      // Fetch the user profile using the token
      fetch(`${API_BASE}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      })
        .then(r => r.json())
        .then(data => {
          if (data.user) {
            setCurrentUser(data.user);
            localStorage.setItem('lumiere_user', JSON.stringify(data.user));
            // Check if there was a redirect intent (e.g. list property)
            const redirectIntent = sessionStorage.getItem('oye_auth_redirect');
            if (redirectIntent) {
              sessionStorage.removeItem('oye_auth_redirect');
              setTimeout(() => setIsListModalOpen(true), 300);
            }
          }
        })
        .catch(console.error)
        .finally(() => {
          // Clean token from URL without page reload
          const url = new URL(window.location.href);
          url.searchParams.delete('auth_token');
          window.history.replaceState({}, '', url.toString());
        });
    }

    const authError = params.get('auth_error');
    if (authError) {
      console.warn('Authentication error:', authError);
      setAuthRedirectReason(
        authError === 'auth_failed'
          ? 'Google sign-in failed: The GOOGLE_CLIENT_SECRET in server/.env is invalid (it must be the GOCSPX-... secret from Google Cloud Console, not the Client ID).'
          : 'Google sign-in could not be completed. Please try again or use email sign-in.'
      );
      setIsAuthModalOpen(true);
      const url = new URL(window.location.href);
      url.searchParams.delete('auth_error');
      window.history.replaceState({}, '', url.toString());
    }
  }, []);

  // Initial Auto-Location Detection on App Load with GPS Precision
  useEffect(() => {
    handleDetectGPS(true);
  }, []);

  const detectLocationDefault = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/location/detect`);
      const data = await res.json();
      setDetectedLocation(data);
      if (data.city) {
        setCurrentCity(data.city);
      }
    } catch (err) {
      console.error('Location detect error:', err);
    }
  };

  const handleDetectGPS = (isSilent = false) => {
    if (!navigator.geolocation) {
      if (!isSilent) alert('Geolocation is not supported by your browser.');
      detectLocationDefault();
      return;
    }

    setIsDetectingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          const res = await fetch(`${API_BASE}/api/location/detect?lat=${lat}&lng=${lng}`);
          const data = await res.json();

          // High accuracy reverse geocoding for precise locality
          try {
            const revRes = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=en`
            );
            if (revRes.ok) {
              const revData = await revRes.json();
              const localityName = revData.locality || revData.city || revData.principalSubdivision;
              if (localityName) {
                data.locality = localityName;
              }
            }
          } catch {
            // fallback to server locality
          }

          setDetectedLocation(data);
          if (data.city) {
            setCurrentCity(data.city);
          }
        } catch (e) {
          console.error('GPS detection fetch error:', e);
          detectLocationDefault();
        } finally {
          setIsDetectingGPS(false);
        }
      },
      (err) => {
        console.warn('Geolocation permission not granted or timeout:', err.message);
        setIsDetectingGPS(false);
        detectLocationDefault();
      },
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60000 }
    );
  };

  // Fetch properties whenever city or filters change
  useEffect(() => {
    fetchProperties();
  }, [currentCity, filters]);

  // Fetch all reels on mount and keep available for transparent area search
  useEffect(() => {
    fetchReels();
  }, []);

  const fetchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (currentCity && currentCity !== 'all' && currentCity !== 'All Cities') {
        params.append('city', currentCity);
      }
      if (filters.search) params.append('search', filters.search);
      if (filters.purpose && filters.purpose !== 'all') params.append('purpose', filters.purpose);
      if (filters.bhk && filters.bhk !== 'all') params.append('bhk', filters.bhk);
      if (filters.propertyType && filters.propertyType !== 'all') params.append('propertyType', filters.propertyType);
      if (filters.facing && filters.facing !== 'all') params.append('facing', filters.facing);
      if (filters.status && filters.status !== 'all') params.append('status', filters.status);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters.sort) params.append('sort', filters.sort);

      const res = await fetch(`${API_BASE}/api/properties?${params.toString()}`);
      const data = await res.json();
      setProperties(data.properties || []);
    } catch (err) {
      console.error('Fetch properties error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchReels = async () => {
    setLoadingReels(true);
    try {
      const res = await fetch(`${API_BASE}/api/properties/reels`);
      const data = await res.json();
      setReels(data.reels || []);
    } catch (err) {
      console.error('Fetch reels error:', err);
    } finally {
      setLoadingReels(false);
    }
  };

  // Wishlist actions (Local + Backend sync)
  const handleToggleWishlist = async (property) => {
    const propId = property.id || property._id;
    const exists = wishlist.some(item => (item.id === propId || item._id === propId));
    const token = localStorage.getItem(TOKEN_KEY);

    setWishlist(prev => {
      const next = exists
        ? prev.filter(item => item.id !== propId && item._id !== propId)
        : [...prev, property];
      try {
        localStorage.setItem('lumiere_guest_wishlist', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    // If authenticated, sync with MongoDB / backend user profile
    if (token) {
      try {
        await fetch(`${API_BASE}/api/users/wishlist/${propId}`, {
          method: exists ? 'DELETE' : 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (err) {
        console.error('Wishlist sync error:', err);
      }
    }
  };

  const handleRemoveWishlist = async (propertyId) => {
    const token = localStorage.getItem(TOKEN_KEY);
    setWishlist(prev => {
      const next = prev.filter(item => item.id !== propertyId && item._id !== propertyId);
      try {
        localStorage.setItem('lumiere_guest_wishlist', JSON.stringify(next));
      } catch (e) {
        console.error(e);
      }
      return next;
    });

    if (token) {
      try {
        await fetch(`${API_BASE}/api/users/wishlist/${propertyId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch (err) {
        console.error('Wishlist remove error:', err);
      }
    }
  };

  // Compare actions
  const handleToggleCompare = (property) => {
    setComparedProperties(prev => {
      const exists = prev.some(item => item.id === property.id);
      if (exists) {
        return prev.filter(item => item.id !== property.id);
      }
      if (prev.length >= 3) {
        alert('You can compare a maximum of 3 luxury properties simultaneously.');
        return prev;
      }
      return [...prev, property];
    });
  };

  const handleWatchReel = (property) => {
    setViewMode('reels');
    setReels(prev => {
      const found = prev.find(r => r.id === property.id);
      if (found) {
        return [found, ...prev.filter(r => r.id !== property.id)];
      }
      return [property, ...prev];
    });
  };

  // Listing Inventory Flow (Protected: profile creation is mandatory)
  const handleOpenListProperty = () => {
    if (!currentUser) {
      setAuthRedirectReason('Profile creation is required to list your exclusive real estate inventory.');
      setIsAuthModalOpen(true);
      return;
    }
    setIsListModalOpen(true);
  };

  const handleAuthSuccess = (user, token) => {
    setCurrentUser(user);
    try {
      localStorage.setItem('lumiere_user', JSON.stringify(user));
      if (token) localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
      console.error(e);
    }
    setIsAuthModalOpen(false);

    // If user intended to list property, automatically open listing modal
    if (authRedirectReason) {
      setAuthRedirectReason('');
      setIsListModalOpen(true);
    }
  };

  const handleLogout = async () => {
    const savedToken = localStorage.getItem(TOKEN_KEY);

    // 1. Reset all authenticated & session user React states
    setCurrentUser(null);
    setWishlist([]);
    setComparedProperties([]);
    setIsDashboardOpen(false);
    setIsAuthModalOpen(false);

    // 2. Clear all auth, wishlist, and profile data from localStorage
    try {
      localStorage.removeItem('lumiere_user');
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem('lumiere_guest_wishlist');
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('oye_') || key.startsWith('lumiere_')) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {
      console.error('LocalStorage clear error:', e);
    }

    // 3. Clear sessionStorage completely
    try {
      sessionStorage.clear();
    } catch (e) {
      console.error('SessionStorage clear error:', e);
    }

    // 4. Clear browser CacheStorage if supported
    try {
      if ('caches' in window) {
        const cacheKeys = await caches.keys();
        await Promise.all(cacheKeys.map(k => caches.delete(k)));
      }
    } catch (e) {
      console.warn('CacheStorage clear error:', e);
    }

    // 5. Notify backend to destroy session & clear auth cookies
    try {
      await fetch(`${API_BASE}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(savedToken ? { 'Authorization': `Bearer ${savedToken}` } : {})
        }
      });
    } catch (e) {
      // Ignore network errors on logout
    }

    // 6. Clean URL from any token or error query parameters
    try {
      const cleanUrl = window.location.origin + window.location.pathname;
      window.history.replaceState({}, '', cleanUrl);
    } catch (e) {}
  };

  const handlePropertyCreated = (newProperty) => {
    setProperties(prev => [newProperty, ...prev]);
    if (newProperty.reelVideo) {
      setReels(prev => [newProperty, ...prev]);
    }
    // Switch to catalogue view to admire the new listing
    setViewMode('catalogue');
  };

  const activeFilterCount = [
    filters.purpose && filters.purpose !== 'all',
    filters.bhk && filters.bhk !== 'all',
    filters.propertyType && filters.propertyType !== 'all',
    filters.facing && filters.facing !== 'all',
    filters.status && filters.status !== 'all',
    filters.maxPrice && filters.maxPrice < 650000000
  ].filter(Boolean).length;

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Top Sticky Navbar */}
      <Navbar
        currentCity={currentCity === 'all' ? 'All Cities' : currentCity}
        onSelectCity={(city) => setCurrentCity(city)}
        onOpenLocationModal={() => setIsLocationModalOpen(true)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        onOpenAISearch={() => setIsAISearchOpen(true)}
        onOpenListProperty={handleOpenListProperty}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthRedirectReason('');
          setIsAuthModalOpen(true);
        }}
        onOpenDashboard={() => setIsDashboardOpen(true)}
        onLogout={handleLogout}
        onDetectGPS={handleDetectGPS}
        isDetectingGPS={isDetectingGPS}
        onOpenAdminPanel={() => setIsAdminPanelOpen(true)}
        notifications={notifications}
        unreadNotifCount={unreadNotifCount}
        onMarkNotifsRead={handleMarkNotifsRead}
      />

      {/* Global Sticky Expanded Search & Filter White Strip */}
      <TopSearchFilterStrip
        searchQuery={filters.search}
        onSearchChange={(val) => setFilters(prev => ({ ...prev, search: val }))}
        onOpenFilterModal={() => setIsFilterModalOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      {/* Main Content Area */}
      <main>
        {viewMode === 'reels' ? (
          <ReelCatalogue
            reels={reels}
            loading={loadingReels}
            currentCity={currentCity}
            onSelectCity={(city) => setCurrentCity(city)}
            wishlist={wishlist}
            onToggleWishlist={handleToggleWishlist}
            onOpenDetail={(prop) => setActiveDetailProperty(prop)}
            onOpenCallback={(prop) => setActiveCallbackProperty(prop)}
            onSwitchToCatalogue={() => setViewMode('catalogue')}
            searchQuery={filters.search}
            onResetSearch={() => setFilters(prev => ({ ...prev, search: '' }))}
          />
        ) : (
          <div className="catalogue-page-wrapper">
            <PropertyGrid
              properties={properties}
              loading={loading}
              filters={filters}
              onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
              onResetFilters={() => setFilters({
                search: '',
                purpose: 'all',
                bhk: 'all',
                propertyType: 'all',
                maxPrice: 650000000,
                facing: 'all',
                status: 'all',
                sort: 'popular'
              })}
              wishlist={wishlist}
              onToggleWishlist={handleToggleWishlist}
              onOpenDetail={(prop) => setActiveDetailProperty(prop)}
              onOpenCallback={(prop) => setActiveCallbackProperty(prop)}
              onWatchReel={handleWatchReel}
              comparedIds={comparedProperties.map(p => p.id)}
              onToggleCompare={handleToggleCompare}
            />
          </div>
        )}
      </main>

      {/* Floating Compare Tray */}
      <CompareDrawer
        comparedProperties={comparedProperties}
        onRemove={(id) => setComparedProperties(prev => prev.filter(p => p.id !== id))}
        onClear={() => setComparedProperties([])}
        onOpenCallback={(prop) => setActiveCallbackProperty(prop)}
        onOpenDetail={(prop) => setActiveDetailProperty(prop)}
      />

      {/* Filter Modal */}
      <FilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        filters={filters}
        onApplyFilters={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))}
        onResetFilters={() => setFilters({
          search: '',
          purpose: 'all',
          bhk: 'all',
          propertyType: 'all',
          maxPrice: 650000000,
          facing: 'all',
          status: 'all',
          sort: 'popular'
        })}
        currentCity={currentCity}
        onSelectCity={(city) => setCurrentCity(city)}
      />

      {/* Location Auto-Detection & City Switcher Modal */}
      <LocationDetectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentCity={currentCity}
        onSelectCity={(city) => setCurrentCity(city)}
        detectedLocation={detectedLocation}
        onDetectGPS={handleDetectGPS}
        isDetectingGPS={isDetectingGPS}
      />

      {/* Wishlist Drawer */}
      <WishlistDrawer
        isOpen={isWishlistOpen}
        onClose={() => setIsWishlistOpen(false)}
        wishlist={wishlist}
        onRemoveItem={handleRemoveWishlist}
        onClearWishlist={() => {
          setWishlist([]);
          try {
            localStorage.removeItem('lumiere_guest_wishlist');
          } catch (e) {
            console.error(e);
          }
        }}
        onOpenDetail={(prop) => setActiveDetailProperty(prop)}
        onOpenCallback={(prop) => setActiveCallbackProperty(prop)}
      />

      {/* Property "Know More" Deep Spec & EMI Modal */}
      {activeDetailProperty && (
        <PropertyDetailModal
          property={activeDetailProperty}
          onClose={() => setActiveDetailProperty(null)}
          isWishlisted={wishlist.some(item => (item.id === activeDetailProperty.id || item._id === activeDetailProperty.id || item.id === activeDetailProperty._id))}
          onToggleWishlist={handleToggleWishlist}
          onOpenCallback={(prop) => {
            setActiveDetailProperty(null);
            setActiveCallbackProperty(prop);
          }}
        />
      )}

      {/* "Get a Call Back" Lead Modal */}
      {activeCallbackProperty && (
        <CallbackModal
          property={activeCallbackProperty}
          isOpen={!!activeCallbackProperty}
          onClose={() => setActiveCallbackProperty(null)}
        />
      )}

      {/* AI Vibe Matchmaker Search Modal */}
      <AIVibeSearchBar
        isOpen={isAISearchOpen}
        onClose={() => setIsAISearchOpen(false)}
        onOpenDetail={(prop) => {
          setIsAISearchOpen(false);
          setActiveDetailProperty(prop);
        }}
        onWatchReel={(prop) => {
          setIsAISearchOpen(false);
          handleWatchReel(prop);
        }}
      />

      {/* Profile Creation / Login Modal (Mandatory for listing inventory) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthRedirectReason('');
        }}
        onAuthSuccess={handleAuthSuccess}
        redirectReason={authRedirectReason}
      />

      {/* List Your Own Inventory Modal */}
      <ListPropertyModal
        isOpen={isListModalOpen}
        onClose={() => setIsListModalOpen(false)}
        onPropertyCreated={handlePropertyCreated}
        currentUser={currentUser}
      />

      {/* User Dashboard Modal (My Listings, Saved, Inquiries, Profile Settings) */}
      <UserDashboard
        isOpen={isDashboardOpen}
        onClose={() => setIsDashboardOpen(false)}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenDetail={(prop) => {
          setIsDashboardOpen(false);
          setActiveDetailProperty(prop);
        }}
        onOpenCallback={(prop) => {
          setIsDashboardOpen(false);
          setActiveCallbackProperty(prop);
        }}
        onOpenListProperty={() => {
          setIsDashboardOpen(false);
          setIsListModalOpen(true);
        }}
        wishlist={wishlist}
        onRemoveWishlistItem={handleRemoveWishlist}
        onOpenAdminPanel={() => {
          setIsDashboardOpen(false);
          setIsAdminPanelOpen(true);
        }}
      />

      {/* Mobile Sticky Bottom Navigation Bar */}
      <MobileBottomNav
        viewMode={viewMode}
        setViewMode={setViewMode}
        onOpenListProperty={handleOpenListProperty}
        wishlistCount={wishlist.length}
        onOpenWishlist={() => setIsWishlistOpen(true)}
        currentUser={currentUser}
        onOpenAuth={() => {
          setAuthRedirectReason('');
          setIsAuthModalOpen(true);
        }}
        onOpenDashboard={() => setIsDashboardOpen(true)}
      />

      {/* Admin Panel — full-screen overlay, only for Admin role */}
      {isAdminPanelOpen && currentUser?.role === 'Admin' && (
        <AdminPanel
          currentUser={currentUser}
          token={localStorage.getItem(TOKEN_KEY)}
          onClose={() => setIsAdminPanelOpen(false)}
        />
      )}

      {/* Home Screen Hardware / Browser Back Exit Confirmation Prompt */}
      {isExitConfirmOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 999999,
          padding: '20px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '24px 20px',
            maxWidth: '360px',
            width: '100%',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)',
            textAlign: 'center'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              background: '#FFF0F1',
              color: '#E71D2B',
              display: 'flex',
              alignItems: 'center',
              justify: 'center',
              margin: '0 auto 12px',
              fontSize: '20px',
              fontWeight: 800
            }}>
              !
            </div>
            <h3 style={{ margin: '0 0 6px', fontSize: '18px', fontWeight: 800, color: '#0F172A' }}>
              Exit Oye Properties?
            </h3>
            <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#64748B', lineHeight: 1.4 }}>
              Are you sure you want to exit the portal? You can continue browsing prime properties in Faridabad and across India.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setIsExitConfirmOpen(false)}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #CBD5E1',
                  background: '#ffffff',
                  color: '#334155',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer'
                }}
              >
                Stay Here
              </button>
              <button
                onClick={() => {
                  setIsExitConfirmOpen(false);
                  window.history.back();
                }}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: 'none',
                  background: '#E71D2B',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 12px rgba(231, 29, 43, 0.25)'
                }}
              >
                Exit Portal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
