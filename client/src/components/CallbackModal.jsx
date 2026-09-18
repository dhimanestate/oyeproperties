import React, { useState, useEffect } from 'react';
import { API_BASE } from '../config';
import { 
  X, 
  PhoneCall, 
  CheckCircle2, 
  MessageSquare, 
  ShieldCheck, 
  ArrowRight
} from 'lucide-react';

export default function CallbackModal({
  property,
  isOpen,
  onClose
}) {
  if (!isOpen || !property) return null;

  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth <= 768 : false
  );

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    preferredTime: 'Instant Callback (Next 5 Mins)',
    channel: 'Call',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successResponse, setSuccessResponse] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  const TIME_SLOTS = [
    { id: 'instant', label: '⚡ Instant Callback', detail: 'Within next 5 minutes' },
    { id: 'evening', label: '🌇 Today Evening', detail: '5:00 PM – 8:00 PM' },
    { id: 'tomorrow', label: '☀️ Tomorrow Morning', detail: '10:00 AM – 1:00 PM' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) {
      setErrorMsg('Please enter your full name and phone number.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await fetch(`${API_BASE}/api/leads/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: property.id,
          ...formData
        })
      });

      const data = await res.json();
      if (res.ok) {
        setSuccessResponse(data);
      } else {
        setErrorMsg(data.error || 'Failed to submit callback request. Please try again.');
      }
    } catch {
      setErrorMsg('Server connection failed. Please ensure the backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setSuccessResponse(null);
    setErrorMsg('');
    onClose();
  };

  return (
    <div
      className="modal-backdrop"
      onClick={handleClose}
      style={{
        alignItems: isMobile ? 'flex-end' : 'center',
        padding: isMobile ? 0 : '16px'
      }}
    >
      <div 
        className="glass-panel-heavy"
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: isMobile ? '100%' : '520px',
          maxHeight: isMobile ? '85dvh' : '92vh',
          overflowY: 'auto',
          overscrollBehavior: 'contain',
          padding: isMobile ? '0 20px 24px' : '28px',
          position: 'relative',
          background: '#ffffff',
          boxShadow: isMobile ? '0 -10px 40px rgba(0,0,0,0.3)' : 'var(--shadow-lg)',
          borderTopLeftRadius: isMobile ? '24px' : 'var(--radius-lg)',
          borderTopRightRadius: isMobile ? '24px' : 'var(--radius-lg)',
          borderBottomLeftRadius: isMobile ? 0 : 'var(--radius-lg)',
          borderBottomRightRadius: isMobile ? 0 : 'var(--radius-lg)',
        }}
      >
        {/* Mobile Pull Handle */}
        {isMobile && (
          <div style={{ width: '100%', display: 'flex', justifyContent: 'center', padding: '10px 0 6px' }}>
            <div style={{ width: '40px', height: '4px', borderRadius: '999px', background: 'rgba(0,0,0,0.18)' }} />
          </div>
        )}
        {/* Close Button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: '20px',
            right: '20px',
            background: 'var(--bg-secondary)',
            border: 'none',
            color: 'var(--text-muted)',
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer'
          }}
        >
          <X size={16} />
        </button>

        {/* Success Confirmation State */}
        {successResponse ? (
          <div style={{ textAlign: 'center', padding: '10px 0' }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: 'rgba(5, 150, 105, 0.12)',
              border: '2px solid var(--accent-emerald)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 16px',
              color: 'var(--accent-emerald)'
            }}>
              <CheckCircle2 size={36} />
            </div>

            <h3 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '6px' }}>
              Callback Successfully Scheduled!
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
              Ticket Reference: <strong style={{ color: 'var(--accent-primary)' }}>{successResponse.lead.id}</strong>
            </p>

            {/* Assigned Agent Card */}
            <div style={{
              background: 'var(--bg-secondary)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              padding: '16px',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              marginBottom: '20px'
            }}>
              <img
                src={successResponse.assignedAgent.photo}
                alt={successResponse.assignedAgent.name}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid var(--accent-primary)'
                }}
              />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '11px', color: '#E71D2B', fontWeight: 700 }}>
                  Assigned Private Portfolio Manager
                </div>
                <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  {successResponse.assignedAgent.name}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Slot: {successResponse.lead.client.preferredTime}
                </div>
              </div>
            </div>

            {/* WhatsApp Direct Action */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <a
                href={successResponse.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-whatsapp"
                style={{ justifyContent: 'center', textDecoration: 'none', padding: '12px' }}
              >
                <MessageSquare size={16} />
                Connect on WhatsApp Right Now
              </a>

              <button
                onClick={handleClose}
                className="btn-secondary"
                style={{ justifyContent: 'center' }}
              >
                Done / Return to Portal
              </button>
            </div>
          </div>
        ) : (
          /* Form State */
          <div>
            <div style={{ marginBottom: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                <div style={{
                  width: '34px',
                  height: '34px',
                  borderRadius: '8px',
                  background: 'var(--bg-secondary)',
                  color: 'var(--accent-primary)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <PhoneCall size={18} />
                </div>
                <h3 style={{ fontSize: '19px', fontWeight: 800, color: 'var(--text-primary)' }}>
                  Get an Instant Callback
                </h3>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
                For <strong style={{ color: 'var(--accent-primary)' }}>{property.title}</strong> ({property.priceFormatted})
              </p>
            </div>

            {errorMsg && (
              <div style={{
                background: 'rgba(225, 29, 72, 0.08)',
                border: '1px solid rgba(225, 29, 72, 0.3)',
                color: '#e11d48',
                fontSize: '12px',
                padding: '8px 12px',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '16px'
              }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Your Full Name *
                </label>
                <input
                  id="callback-input-name"
                  type="text"
                  required
                  placeholder="e.g. Vikram Singhania"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                />
              </div>

              <div style={{ marginBottom: '14px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                  Phone Number (Mobile / WhatsApp) *
                </label>
                <input
                  id="callback-input-phone"
                  type="tel"
                  required
                  placeholder="e.g. +91 98200 12345"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  style={{
                    width: '100%',
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    padding: '10px 14px',
                    color: 'var(--text-primary)',
                    fontSize: '13px',
                    outline: 'none'
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-primary)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-subtle)'}
                />
              </div>

              {/* Preferred Time Slot */}
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Preferred Callback Window
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '8px' }}>
                  {TIME_SLOTS.map(slot => (
                    <div
                      key={slot.id}
                      onClick={() => setFormData({ ...formData, preferredTime: slot.label })}
                      style={{
                        background: formData.preferredTime === slot.label ? 'rgba(37, 99, 235, 0.08)' : 'var(--bg-secondary)',
                        border: formData.preferredTime === slot.label ? '1px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                        borderRadius: 'var(--radius-md)',
                        padding: '10px 14px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {slot.label}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {slot.detail}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Preferred Channel */}
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  Preferred Contact Method
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, channel: 'Call' })}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 'var(--radius-sm)',
                      background: formData.channel === 'Call' ? 'var(--accent-primary)' : 'var(--bg-secondary)',
                      color: formData.channel === 'Call' ? '#ffffff' : 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '12px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Direct Phone Call
                  </button>

                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, channel: 'WhatsApp' })}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: 'var(--radius-sm)',
                      background: formData.channel === 'WhatsApp' ? '#25d366' : 'var(--bg-secondary)',
                      color: formData.channel === 'WhatsApp' ? '#ffffff' : 'var(--text-primary)',
                      fontWeight: 700,
                      fontSize: '12px',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    WhatsApp Chat
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                id="btn-submit-callback"
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{ width: '100%', justifyContent: 'center', padding: '12px' }}
              >
                {isSubmitting ? 'Registering Request...' : 'Schedule Call Back Now'}
                <ArrowRight size={16} />
              </button>

              <div style={{
                marginTop: '12px',
                fontSize: '11px',
                color: 'var(--text-muted)',
                textAlign: 'center',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '4px'
              }}>
                <ShieldCheck size={13} color="var(--accent-emerald)" />
                Zero-spam assurance. Your details are strictly kept confidential.
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
