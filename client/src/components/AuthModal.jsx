import React, { useState } from 'react';
import { API_BASE } from '../config';
import { X, User, Mail, Phone, Lock, ShieldCheck, ArrowRight } from 'lucide-react';

const GOOGLE_AUTH_URL = `${API_BASE}/api/auth/google`;

export default function AuthModal({
  isOpen,
  onClose,
  onAuthSuccess,
  onLoginSuccess,
  redirectReason,
}) {
  if (!isOpen) return null;

  const handleSuccessCallback = onAuthSuccess || onLoginSuccess;

  const [mode, setMode] = useState('register');
  const [role, setRole] = useState('Property Owner');
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const isMobile = window.innerWidth <= 768;

  // ─── Google Login ────────────────────────────────────────────────────────────
  const handleGoogleLogin = () => {
    // Store redirect intent in sessionStorage so callback page can open list modal
    if (redirectReason) sessionStorage.setItem('oye_auth_redirect', redirectReason);
    const returnTo = window.location.origin;
    window.location.href = `${GOOGLE_AUTH_URL}?return_to=${encodeURIComponent(returnTo)}`;
  };

  // ─── Email / Password ─────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === 'register' && (!formData.name || !formData.email || !formData.phone)) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }
    if (!formData.email) {
      setErrorMsg('Please enter your email.');
      return;
    }
    setLoading(true);
    setErrorMsg('');

    try {
      const endpoint = mode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const res = await fetch(`${API_BASE}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name || formData.email.split('@')[0],
          email: formData.email,
          phone: formData.phone || '',
          password: formData.password || undefined,
          role,
        }),
      });

      const data = await res.json();

      if (res.ok && data.user) {
        // Persist JWT
        if (data.token) localStorage.setItem('oye_auth_token', data.token);
        handleSuccessCallback?.(data.user);
        onClose();
      } else {
        setErrorMsg(data.error || 'Authentication failed. Please try again.');
      }
    } catch {
      // Offline fallback
      const user = {
        id: `usr-${Date.now().toString(36)}`,
        name: formData.name || formData.email.split('@')[0],
        email: formData.email,
        phone: formData.phone,
        role,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      };
      handleSuccessCallback?.(user);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  // ─── Styles ───────────────────────────────────────────────────────────────────
  const inputStyle = {
    width: '100%',
    padding: '10px 14px 10px 38px',
    borderRadius: 'var(--radius-md)',
    border: '1.5px solid var(--border-subtle)',
    fontSize: '13px',
    fontFamily: 'var(--font-poppins)',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    boxSizing: 'border-box',
  };

  const iconStyle = {
    position: 'absolute',
    left: '12px',
    top: '50%',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
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
          maxWidth: isMobile ? '100%' : '480px',
          maxHeight: '92dvh',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          padding: isMobile ? '0 20px 32px' : '32px',
          background: '#ffffff',
          borderTopLeftRadius: '24px',
          borderTopRightRadius: '24px',
          borderBottomLeftRadius: isMobile ? 0 : 'var(--radius-lg)',
          borderBottomRightRadius: isMobile ? 0 : 'var(--radius-lg)',
          position: 'relative',
          boxShadow: isMobile ? '0 -10px 40px rgba(0,0,0,0.2)' : 'var(--shadow-lg)',
          boxSizing: 'border-box',
        }}
      >
        {/* Drag handle (mobile) */}
        {isMobile && (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
            <div style={{ width: '40px', height: '4px', borderRadius: '999px', background: 'rgba(0,0,0,0.15)' }} />
          </div>
        )}

        {/* Close Button */}
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: '20px', right: '20px',
            background: 'rgba(0,0,0,0.05)', border: 'none', color: 'var(--text-muted)',
            width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <X size={16} />
        </button>

        {/* Redirect Reason Alert */}
        {redirectReason && (
          <div style={{
            background: '#FFF0F1', border: '1px solid rgba(231,29,43,0.25)',
            borderRadius: 'var(--radius-sm)', padding: '10px 14px', marginBottom: '16px',
            fontSize: '12px', color: '#E71D2B', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <ShieldCheck size={16} />
            <span>{redirectReason}</span>
          </div>
        )}

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '20px' }}>
          <div style={{
            width: '48px', height: '48px', borderRadius: '12px',
            background: 'var(--oye-red)', color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <User size={24} />
          </div>
          <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '4px' }}>
            {mode === 'register' ? 'Create Your Profile' : 'Welcome Back'}
          </h3>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', lineHeight: 1.5 }}>
            {mode === 'register'
              ? "Join India & Dubai's premier luxury real estate network"
              : 'Access your listings, wishlist, and inquiries'}
          </p>
        </div>

        {/* ── Continue with Google (Primary CTA) ── */}
        <button
          id="btn-google-auth"
          type="button"
          onClick={handleGoogleLogin}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
            padding: '12px 20px',
            borderRadius: 'var(--radius-full)',
            border: '1.5px solid #EDEDED',
            background: '#ffffff',
            fontFamily: 'var(--font-poppins)',
            fontSize: '14px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            marginBottom: '16px',
            boxSizing: 'border-box',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#E71D2B'; e.currentTarget.style.background = '#FFF0F1'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#EDEDED'; e.currentTarget.style.background = '#ffffff'; }}
        >
          {/* Google Icon SVG */}
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Continue with Google
        </button>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
          <div style={{ flex: 1, height: '1px', background: '#EDEDED' }} />
          <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500, whiteSpace: 'nowrap' }}>
            or continue with email
          </span>
          <div style={{ flex: 1, height: '1px', background: '#EDEDED' }} />
        </div>

        {/* Mode Tabs */}
        <div style={{
          display: 'flex', background: 'var(--bg-secondary)',
          borderRadius: 'var(--radius-full)', padding: '4px', marginBottom: '18px',
          border: '1px solid var(--border-subtle)',
        }}>
          {['register', 'login'].map(m => (
            <button
              key={m}
              type="button"
              onClick={() => { setMode(m); setErrorMsg(''); }}
              style={{
                flex: 1, padding: '8px', borderRadius: 'var(--radius-full)', border: 'none',
                background: mode === m ? 'var(--oye-red)' : 'transparent',
                color: mode === m ? '#ffffff' : 'var(--text-muted)',
                fontWeight: 700, fontSize: '12.5px', cursor: 'pointer',
                fontFamily: 'var(--font-poppins)', transition: 'all 0.2s ease',
              }}
            >
              {m === 'register' ? 'Create Profile' : 'Sign In'}
            </button>
          ))}
        </div>

        {/* Error */}
        {errorMsg && (
          <div style={{
            background: 'rgba(231,29,43,0.08)', border: '1px solid rgba(231,29,43,0.3)',
            color: '#E71D2B', fontSize: '12px', padding: '8px 12px',
            borderRadius: 'var(--radius-sm)', marginBottom: '14px',
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role (register only) */}
          {mode === 'register' && (
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                I am listing as:
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '8px' }}>
                {['Property Owner', 'Verified Broker', 'Direct Builder'].map(r => (
                  <button
                    key={r} type="button" onClick={() => setRole(r)}
                    style={{
                      background: role === r ? 'var(--oye-red)' : 'var(--bg-secondary)',
                      color: role === r ? '#ffffff' : 'var(--text-secondary)',
                      border: role === r ? '1px solid var(--oye-red)' : '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-sm)', padding: '8px 4px',
                      fontSize: '11px', fontWeight: 700, cursor: 'pointer',
                      transition: 'all 0.2s ease', textAlign: 'center',
                      fontFamily: 'var(--font-poppins)',
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Full Name (register only) */}
          {mode === 'register' && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Full Name *
              </label>
              <div style={{ position: 'relative' }}>
                <User size={15} color="var(--text-muted)" style={iconStyle} />
                <input
                  type="text" required placeholder="e.g. Vikram Malhotra"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {/* Email */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Email Address *
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={15} color="var(--text-muted)" style={iconStyle} />
              <input
                type="email" required placeholder="your@email.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Phone (register only) */}
          {mode === 'register' && (
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                Phone / WhatsApp *
              </label>
              <div style={{ position: 'relative' }}>
                <Phone size={15} color="var(--text-muted)" style={iconStyle} />
                <input
                  type="tel" required placeholder="+91 98200 12345"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  style={inputStyle}
                />
              </div>
            </div>
          )}

          {/* Password */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px' }}>
              Password {mode === 'register' ? '(optional with Google)' : ''}
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={15} color="var(--text-muted)" style={iconStyle} />
              <input
                type="password" placeholder="••••••••"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            id="btn-submit-auth"
            type="submit"
            disabled={loading}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '14px', boxSizing: 'border-box' }}
          >
            {loading ? 'Processing...' : mode === 'register' ? 'Create Profile & Continue' : 'Sign In'}
            {!loading && <ArrowRight size={16} />}
          </button>
        </form>

        {/* Footer note */}
        <p style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', marginTop: '16px' }}>
          By continuing, you agree to our Terms of Service & Privacy Policy.
        </p>
      </div>
    </div>
  );
}
