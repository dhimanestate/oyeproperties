import React, { useState, useEffect } from 'react';
import {
  X, Home, Heart, Bell, User, Settings, LogOut,
  PlusCircle, MapPin, ChevronRight, Loader2,
  CheckCircle2, Clock, Phone, Building2, Trash2,
  Edit3, Camera, Shield,
} from 'lucide-react';
import { API_BASE } from '../config';

const TOKEN_KEY = 'oye_auth_token';

const tabStyle = (active) => ({
  padding: '10px 18px',
  border: 'none',
  borderRadius: 'var(--radius-full)',
  background: active ? 'var(--oye-red)' : 'transparent',
  color: active ? '#ffffff' : 'var(--text-muted)',
  fontWeight: active ? 700 : 500,
  fontSize: '13px',
  fontFamily: 'var(--font-poppins)',
  cursor: 'pointer',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap',
  flexShrink: 0,
});

export default function UserDashboard({
  isOpen,
  onClose,
  currentUser,
  onLogout,
  onOpenDetail,
  onOpenCallback,
  onOpenListProperty,
  onOpenAdminPanel,
  wishlist,
  onRemoveWishlistItem,
}) {
  const [activeTab, setActiveTab] = useState('listings');
  const [listings, setListings] = useState([]);
  const [inquiries, setInquiries] = useState([]);
  const [profileData, setProfileData] = useState({ name: '', phone: '', role: '' });
  const [loadingListings, setLoadingListings] = useState(false);
  const [loadingInquiries, setLoadingInquiries] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);

  const token = localStorage.getItem(TOKEN_KEY);
  const authHeaders = { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' };

  useEffect(() => {
    if (!isOpen || !currentUser) return;
    setProfileData({ name: currentUser.name || '', phone: currentUser.phone || '', role: currentUser.role || 'Property Owner' });
  }, [isOpen, currentUser]);

  useEffect(() => {
    if (!isOpen || !token) return;
    if (activeTab === 'listings') fetchListings();
    if (activeTab === 'inquiries') fetchInquiries();
  }, [isOpen, activeTab, token]);

  const fetchListings = async () => {
    setLoadingListings(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/listings`, { headers: authHeaders });
      const data = await res.json();
      setListings(data.listings || []);
    } catch { setListings([]); } finally { setLoadingListings(false); }
  };

  const fetchInquiries = async () => {
    setLoadingInquiries(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/inquiries`, { headers: authHeaders });
      const data = await res.json();
      setInquiries(data.inquiries || []);
    } catch { setInquiries([]); } finally { setLoadingInquiries(false); }
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch(`${API_BASE}/api/users/profile`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(profileData),
      });
      if (res.ok) {
        setProfileSaved(true);
        setTimeout(() => setProfileSaved(false), 3000);
      }
    } catch {} finally { setSavingProfile(false); }
  };

  if (!isOpen) return null;

  const isMobile = window.innerWidth <= 768;

  const statusColor = (s) => {
    if (s === 'Assigned') return '#E71D2B';
    if (s === 'In Progress') return '#f59e0b';
    if (s === 'Closed') return '#16a34a';
    return '#999';
  };

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      style={{ alignItems: isMobile ? 'flex-end' : 'center', padding: isMobile ? 0 : '16px' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: isMobile ? '100%' : '700px',
          maxHeight: isMobile ? '94dvh' : '88vh',
          background: '#ffffff',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          borderBottomLeftRadius: isMobile ? 0 : 'var(--radius-lg)',
          borderBottomRightRadius: isMobile ? 0 : 'var(--radius-lg)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: isMobile ? '0 -10px 40px rgba(0,0,0,0.2)' : 'var(--shadow-lg)',
        }}
      >
        {/* Drag Handle */}
        {isMobile && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '10px 0 4px' }}>
            <div style={{ width: '40px', height: '4px', borderRadius: '999px', background: 'rgba(0,0,0,0.12)' }} />
          </div>
        )}

        {/* ── Header ── */}
        <div style={{
          padding: '18px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '14px',
          flexShrink: 0,
        }}>
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80'}
            alt={currentUser?.name}
            style={{ width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid var(--oye-red)' }}
          />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {currentUser?.name || 'My Dashboard'}
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', fontWeight: 500 }}>
              {currentUser?.role} · {currentUser?.email}
            </div>
          </div>
          {/* Admin Console Button (Visible to Admin Users) */}
          {currentUser?.role === 'Admin' && (
            <button
              id="btn-dashboard-admin-console"
              onClick={() => {
                onClose();
                onOpenAdminPanel?.();
              }}
              style={{
                background: '#E71D2B',
                color: '#ffffff',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                padding: '6px 14px',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0,
                fontFamily: 'var(--font-poppins)',
                boxShadow: '0 2px 10px rgba(231,29,43,0.35)',
                transition: 'all 0.18s ease',
              }}
              title="Open Admin Console"
            >
              <Shield size={13} color="#ffffff" />
              <span>Admin Console</span>
            </button>
          )}

          <button
            id="btn-dashboard-logout"
            onClick={() => { onLogout?.(); onClose(); }}
            style={{
              background: '#FFF0F1',
              color: 'var(--oye-red)',
              border: '1px solid rgba(231,29,43,0.25)',
              borderRadius: 'var(--radius-full)',
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexShrink: 0,
              fontFamily: 'var(--font-poppins)',
              transition: 'all 0.18s ease',
            }}
            title="Logout of your account"
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--oye-red)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#FFF0F1'; e.currentTarget.style.color = 'var(--oye-red)'; }}
          >
            <LogOut size={13} />
            <span>Logout</span>
          </button>
          <button
            onClick={onClose}
            style={{ background: '#F5F5F5', border: 'none', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }}
          >
            <X size={15} color="var(--text-muted)" />
          </button>
        </div>

        {/* ── Admin Mode Quick Access Banner ── */}
        {currentUser?.role === 'Admin' && (
          <div style={{
            background: 'linear-gradient(90deg, #FFF0F1 0%, #FFF8F8 100%)',
            borderBottom: '1px solid #FFD0D4',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Shield size={16} color="#E71D2B" />
              <div>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#1F1F1F', fontFamily: 'var(--font-poppins)' }}>
                  Administrator Access Active
                </span>
                <span style={{ fontSize: '11px', color: '#666666', marginLeft: '6px', fontFamily: 'var(--font-poppins)' }}>
                  (Approvals, CMS, Users & Stats)
                </span>
              </div>
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenAdminPanel?.();
              }}
              style={{
                background: '#E71D2B',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                padding: '5px 12px',
                fontSize: '11.5px',
                fontWeight: 700,
                fontFamily: 'var(--font-poppins)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
              }}
            >
              Open Admin Portal &rarr;
            </button>
          </div>
        )}

        {/* ── Tabs ── */}
        <div style={{
          display: 'flex',
          gap: '4px',
          padding: '10px 16px',
          borderBottom: '1px solid var(--border-subtle)',
          overflowX: 'auto',
          scrollbarWidth: 'none',
          flexShrink: 0,
          background: '#FAFAFA',
        }}>
          {[
            { id: 'listings', label: 'My Listings', icon: <Building2 size={13} /> },
            { id: 'saved', label: `Saved (${wishlist?.length || 0})`, icon: <Heart size={13} /> },
            { id: 'inquiries', label: 'Inquiries', icon: <Bell size={13} /> },
            { id: 'profile', label: 'Profile', icon: <Settings size={13} /> },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                ...tabStyle(activeTab === tab.id),
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
          {currentUser?.role === 'Admin' && (
            <button
              onClick={() => {
                onClose();
                onOpenAdminPanel?.();
              }}
              style={{
                padding: '10px 18px',
                border: '1.5px solid #E71D2B',
                borderRadius: 'var(--radius-full)',
                background: '#FFF0F1',
                color: '#E71D2B',
                fontWeight: 700,
                fontSize: '13px',
                fontFamily: 'var(--font-poppins)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Shield size={13} color="#E71D2B" />
              Admin Portal
            </button>
          )}
        </div>

        {/* ── Body ── */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px 24px', scrollbarWidth: 'thin' }}>

          {/* MY LISTINGS */}
          {activeTab === 'listings' && (
            <div>
              <button
                onClick={() => { onClose(); onOpenListProperty?.(); }}
                className="btn-primary"
                style={{ marginBottom: '16px', fontSize: '13px', padding: '9px 18px' }}
              >
                <PlusCircle size={14} />
                List New Property
              </button>
              {loadingListings ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0', color: 'var(--text-muted)' }}>
                  <Loader2 size={24} className="animate-spin" />
                </div>
              ) : listings.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <Building2 size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <p style={{ fontSize: '14px', fontWeight: 600 }}>No listings yet</p>
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>Click "List New Property" to add your first property</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {listings.map(prop => (
                    <PropertyCard key={prop.id || prop._id} prop={prop} onOpenDetail={onOpenDetail} onOpenCallback={onOpenCallback} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SAVED / WISHLIST */}
          {activeTab === 'saved' && (
            <div>
              {(!wishlist || wishlist.length === 0) ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <Heart size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <p style={{ fontSize: '14px', fontWeight: 600 }}>No saved properties</p>
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>Tap the heart icon on any property to save it</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {wishlist.map(prop => (
                    <PropertyCard
                      key={prop.id || prop._id}
                      prop={prop}
                      onOpenDetail={onOpenDetail}
                      onOpenCallback={onOpenCallback}
                      onRemove={onRemoveWishlistItem}
                      showRemove
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* INQUIRIES */}
          {activeTab === 'inquiries' && (
            <div>
              {loadingInquiries ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
                  <Loader2 size={24} className="animate-spin" color="var(--text-muted)" />
                </div>
              ) : inquiries.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                  <Bell size={40} style={{ margin: '0 auto 12px', opacity: 0.3 }} />
                  <p style={{ fontSize: '14px', fontWeight: 600 }}>No inquiries yet</p>
                  <p style={{ fontSize: '12px', marginTop: '4px' }}>When you request callbacks, they'll appear here</p>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {inquiries.map(inq => (
                    <div key={inq._id} style={{
                      background: '#FAFAFA', border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)', padding: '14px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px', marginBottom: '8px' }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>{inq.propertyTitle}</div>
                          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <MapPin size={11} />
                            {inq.propertyCity}
                          </div>
                        </div>
                        <span style={{
                          background: `${statusColor(inq.status)}15`,
                          color: statusColor(inq.status),
                          fontSize: '10px', fontWeight: 700,
                          padding: '3px 8px', borderRadius: '99px',
                          whiteSpace: 'nowrap', flexShrink: 0,
                        }}>
                          {inq.status}
                        </span>
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--text-secondary)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                        <span><Clock size={11} style={{ verticalAlign: 'middle' }} /> {inq.client?.preferredTime}</span>
                        <span><Phone size={11} style={{ verticalAlign: 'middle' }} /> {inq.client?.phone}</span>
                        <span style={{ color: 'var(--text-muted)' }}>ID: {inq.leadId}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PROFILE SETTINGS */}
          {activeTab === 'profile' && (
            <div>
              <form onSubmit={handleSaveProfile}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '20px' }}>
                  {/* Avatar preview */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '4px' }}>
                    <img
                      src={currentUser?.avatar}
                      alt="Avatar"
                      style={{ width: '56px', height: '56px', borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--border-subtle)' }}
                    />
                    <div>
                      <div style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-primary)' }}>{currentUser?.email}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                        {currentUser?.googleId ? '🔗 Linked with Google' : 'Email account'}
                      </div>
                    </div>
                  </div>

                  <FieldInput label="Full Name" value={profileData.name}
                    onChange={v => setProfileData(p => ({ ...p, name: v }))} />
                  <FieldInput label="Phone / WhatsApp" value={profileData.phone} type="tel"
                    onChange={v => setProfileData(p => ({ ...p, phone: v }))} />

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '6px' }}>Role</label>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                      {['Property Owner', 'Verified Broker', 'Direct Builder'].map(r => (
                        <button key={r} type="button" onClick={() => setProfileData(p => ({ ...p, role: r }))}
                          style={{
                            background: profileData.role === r ? 'var(--oye-red)' : 'var(--bg-secondary)',
                            color: profileData.role === r ? '#fff' : 'var(--text-secondary)',
                            border: profileData.role === r ? '1px solid var(--oye-red)' : '1px solid var(--border-subtle)',
                            borderRadius: 'var(--radius-sm)', padding: '8px 4px',
                            fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                            fontFamily: 'var(--font-poppins)', transition: 'all 0.2s ease',
                          }}
                        >
                          {r}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <button type="submit" disabled={savingProfile} className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '11px' }}>
                  {savingProfile ? 'Saving...' : profileSaved ? '✓ Saved!' : 'Save Changes'}
                </button>
              </form>

              {/* Sign out */}
              <button
                onClick={() => { onLogout(); onClose(); }}
                style={{
                  width: '100%', marginTop: '16px', padding: '10px', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: '8px',
                  background: '#FFF0F1', border: '1px solid rgba(231,29,43,0.2)',
                  borderRadius: 'var(--radius-full)', color: 'var(--oye-red)',
                  fontWeight: 600, fontSize: '13px', cursor: 'pointer',
                  fontFamily: 'var(--font-poppins)',
                }}
              >
                <LogOut size={14} />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Reusable input field ──────────────────────────────────────────────────────
function FieldInput({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-md)',
          border: '1.5px solid var(--border-subtle)', fontSize: '13px',
          fontFamily: 'var(--font-poppins)', outline: 'none', boxSizing: 'border-box',
        }}
      />
    </div>
  );
}

// ── Property mini-card ────────────────────────────────────────────────────────
function PropertyCard({ prop, onOpenDetail, onOpenCallback, onRemove, showRemove }) {
  return (
    <div style={{
      display: 'flex', gap: '12px', background: '#FAFAFA',
      border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '12px',
      alignItems: 'center',
    }}>
      <img
        src={prop.images?.[0]}
        alt={prop.title}
        style={{ width: '64px', height: '64px', borderRadius: '10px', objectFit: 'cover', flexShrink: 0 }}
        onError={e => { e.target.src = 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=300&q=80'; }}
      />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{prop.title}</div>
        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <MapPin size={10} />
          {prop.location?.locality || prop.location?.address}, {prop.location?.city}
        </div>
        <div style={{ fontSize: '10.5px', color: 'var(--text-secondary)', marginTop: '2px' }}>
          {prop.bhk ? `${prop.bhk} BHK` : prop.propertyType} • {prop.areaSqFt ? `${prop.areaSqFt.toLocaleString()} ${prop.areaUnit || 'Sq. Ft.'}` : ''} • {prop.floor || 'Standard Floor'}
        </div>
        <div style={{ fontSize: '13px', fontWeight: 800, color: 'var(--oye-red)', marginTop: '3px' }}>{prop.priceFormatted}</div>
      </div>
      <div style={{ display: 'flex', gap: '6px', flexShrink: 0 }}>
        <button
          onClick={() => onOpenDetail?.(prop)}
          style={{
            background: 'var(--oye-red)', color: '#fff', border: 'none',
            borderRadius: 'var(--radius-full)', padding: '6px 12px',
            fontSize: '11px', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-poppins)',
          }}
        >
          View
        </button>
        {showRemove && (
          <button
            onClick={() => onRemove?.(prop.id || prop._id)}
            style={{
              background: '#FFF0F1', color: 'var(--oye-red)', border: '1px solid rgba(231,29,43,0.2)',
              borderRadius: 'var(--radius-full)', padding: '6px',
              fontSize: '11px', cursor: 'pointer', display: 'flex', alignItems: 'center',
            }}
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  );
}
