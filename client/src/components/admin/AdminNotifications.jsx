import React, { useState, useEffect } from 'react';
import {
  BellIcon,
  SendIcon,
  RefreshIcon,
  CheckIcon,
  CloseIcon,
  AlertIcon,
  GiftIcon,
  UsersIcon,
  MapPinIcon,
  BuildingIcon
} from './AdminIcons';
import { ALL_INDIAN_CITIES } from '../../data/indiaGeographicDirectory';

const CITIES = ALL_INDIAN_CITIES;

const NOTIF_TYPES = [
  { value: 'general', label: 'General', desc: 'Platform announcements & updates', icon: BellIcon },
  { value: 'offer', label: 'Offer', desc: 'Promotions, deals & opportunities', icon: GiftIcon },
  { value: 'alert', label: 'Alert', desc: 'Important urgent system notices', icon: AlertIcon },
  { value: 'reminder', label: 'Reminder', desc: 'Listing status check & verification', icon: RefreshIcon },
];

const TEMPLATES = [
  { label: 'New Listings Alert', title: 'New Premium Properties Just Listed', message: 'Exciting new luxury listings have been added in your preferred location. Browse now for exclusive early access.' },
  { label: 'Exclusive Offer', title: 'Exclusive Investor Offer This Week', message: 'For a limited time, get priority developer rates and direct advisory support from our team.' },
  { label: 'Status Check Reminder', title: 'Is Your Property Still Available?', message: 'Please confirm if your listed property is still available or mark it as sold to keep portal inventory accurate.' },
  { label: 'Listing Approval Notice', title: 'Your Property is Now Live on Oye Properties', message: 'Great news! Your property listing has been verified and is now visible to thousands of active buyers.' },
  { label: 'Market Insights', title: 'Quarterly Prime Market Report', message: 'Property appreciation in top metro micro-markets reached +8% this quarter. Explore trending properties today.' },
];

export default function AdminNotifications({ token, authHeaders, API_BASE }) {
  const [target, setTarget] = useState('all');
  const [city, setCity] = useState('Mumbai');
  const [customUserEmail, setCustomUserEmail] = useState('');
  const [userSearchResults, setUserSearchResults] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [notifType, setNotifType] = useState('general');
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState('');
  const [log, setLog] = useState([]);
  const [logLoading, setLogLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('compose');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 4000); };

  useEffect(() => {
    if (activeTab === 'log') fetchLog();
  }, [activeTab]);

  const fetchLog = async () => {
    setLogLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/admin/notifications/log?limit=50`, { headers: authHeaders });
      const data = await r.json();
      if (data.success) setLog(data.log || []);
    } catch { }
    setLogLoading(false);
  };

  const searchUsers = async (q) => {
    setCustomUserEmail(q);
    if (q.length < 2) return setUserSearchResults([]);
    try {
      const r = await fetch(`${API_BASE}/api/admin/users?search=${encodeURIComponent(q)}&limit=5`, { headers: authHeaders });
      const data = await r.json();
      if (data.success) setUserSearchResults(data.users || []);
    } catch { }
  };

  const applyTemplate = (tpl) => {
    setTitle(tpl.title);
    setMessage(tpl.message);
  };

  const handleSend = async () => {
    if (!title.trim() || !message.trim()) return showToast('Subject and message content are required.');

    const payload = { target, title, message, type: notifType };
    if (target === 'city') payload.city = city;
    if (target === 'users') {
      if (selectedUsers.length === 0) return showToast('Please select at least one recipient user.');
      payload.userIds = selectedUsers.map(u => u._id);
    }

    setSending(true);
    try {
      const r = await fetch(`${API_BASE}/api/admin/notifications/send`, {
        method: 'POST',
        headers: authHeaders,
        body: JSON.stringify(payload),
      });
      const data = await r.json();
      if (data.success) {
        showToast(`Dispatched to ${data.sent} recipient(s) successfully`);
        setTitle('');
        setMessage('');
        setSelectedUsers([]);
      } else {
        showToast(data.error || 'Failed to dispatch notifications');
      }
    } catch {
      showToast('Network error during transmission');
    }
    setSending(false);
  };

  const renderTypeIcon = (type) => {
    if (type === 'offer') return <GiftIcon size={16} />;
    if (type === 'alert') return <AlertIcon size={16} />;
    if (type === 'reminder') return <RefreshIcon size={16} />;
    if (type === 'approval') return <CheckIcon size={16} />;
    return <BellIcon size={16} />;
  };

  return (
    <div className="admin-section">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">Notification Hub</h2>
          <p className="admin-section-subtitle">Broadcast messages and targeted in-app alerts</p>
        </div>
        <div className="admin-tab-group">
          <button
            className={`admin-tab ${activeTab === 'compose' ? 'active' : ''}`}
            onClick={() => setActiveTab('compose')}
          >
            Compose Alert
          </button>
          <button
            className={`admin-tab ${activeTab === 'log' ? 'active' : ''}`}
            onClick={() => setActiveTab('log')}
          >
            Dispatch History
          </button>
        </div>
      </div>

      {activeTab === 'compose' ? (
        <div className="admin-notif-composer">
          {/* Target Selection */}
          <div className="admin-card">
            <h3 className="admin-card-title">Target Audience</h3>
            <div className="admin-target-options">
              {[
                { val: 'all', label: 'All Registered Users', desc: 'Broadcast to everyone registered on the portal' },
                { val: 'city', label: 'City Audience Group', desc: 'Target listers and buyers in a specific market' },
                { val: 'users', label: 'Specific Selected Users', desc: 'Deliver custom notice to selected individuals' },
              ].map(opt => (
                <label key={opt.val} className={`admin-target-card ${target === opt.val ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    value={opt.val}
                    checked={target === opt.val}
                    onChange={() => setTarget(opt.val)}
                    style={{ display: 'none' }}
                  />
                  <div className="admin-target-card-label">{opt.label}</div>
                  <div className="admin-target-card-desc">{opt.desc}</div>
                </label>
              ))}
            </div>

            {target === 'city' && (
              <div style={{ marginTop: '1rem' }}>
                <label className="admin-label">Select City Market</label>
                <select className="admin-select" value={city} onChange={e => setCity(e.target.value)}>
                  {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            )}

            {target === 'users' && (
              <div style={{ marginTop: '1rem' }}>
                <label className="admin-label">Search Users by Name or Email</label>
                <input
                  className="admin-input"
                  placeholder="Type name or email to search..."
                  value={customUserEmail}
                  onChange={e => searchUsers(e.target.value)}
                />
                {userSearchResults.length > 0 && (
                  <div className="admin-user-search-results">
                    {userSearchResults.map(u => (
                      <div
                        key={u._id}
                        className="admin-user-search-item"
                        onClick={() => {
                          if (!selectedUsers.find(x => x._id === u._id)) {
                            setSelectedUsers(prev => [...prev, u]);
                          }
                          setCustomUserEmail('');
                          setUserSearchResults([]);
                        }}
                      >
                        {u.avatar ? (
                          <img src={u.avatar} alt="" className="admin-user-thumb" />
                        ) : (
                          <div className="admin-user-avatar-sm">{u.name?.[0]?.toUpperCase()}</div>
                        )}
                        <div>
                          <div>{u.name}</div>
                          <div className="admin-meta-sub">{u.email}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {selectedUsers.length > 0 && (
                  <div className="admin-selected-users">
                    {selectedUsers.map(u => (
                      <span key={u._id} className="admin-selected-user-chip">
                        <span>{u.name}</span>
                        <button onClick={() => setSelectedUsers(prev => prev.filter(x => x._id !== u._id))}>
                          <CloseIcon size={12} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Templates */}
          <div className="admin-card">
            <h3 className="admin-card-title">Quick Preset Templates</h3>
            <div className="admin-template-grid">
              {TEMPLATES.map((tpl, i) => (
                <button key={i} className="admin-template-btn" onClick={() => applyTemplate(tpl)}>
                  {tpl.label}
                </button>
              ))}
            </div>
          </div>

          {/* Compose Form */}
          <div className="admin-card">
            <h3 className="admin-card-title">Compose Message</h3>

            <div className="admin-form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="admin-label">Category</label>
              <div className="admin-notif-types">
                {NOTIF_TYPES.map(t => {
                  const IconComp = t.icon;
                  return (
                    <label key={t.value} className={`admin-notif-type-card ${notifType === t.value ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        value={t.value}
                        checked={notifType === t.value}
                        onChange={() => setNotifType(t.value)}
                        style={{ display: 'none' }}
                      />
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                        <IconComp size={15} />
                        <span>{t.label}</span>
                      </div>
                      <div className="admin-meta-sub" style={{ marginTop: '0.2rem' }}>{t.desc}</div>
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="admin-form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="admin-label">Headline / Subject *</label>
              <input
                className="admin-input"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Clear headline displayed in the user notification bell"
                maxLength={80}
              />
              <div className="admin-meta-sub" style={{ textAlign: 'right', marginTop: '0.25rem' }}>
                {title.length} / 80
              </div>
            </div>

            <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
              <label className="admin-label">Message Content *</label>
              <textarea
                className="admin-textarea"
                rows={4}
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Write the full message details for the recipient..."
                maxLength={400}
              />
              <div className="admin-meta-sub" style={{ textAlign: 'right', marginTop: '0.25rem' }}>
                {message.length} / 400
              </div>
            </div>

            {/* Live Preview */}
            {(title || message) && (
              <div className="admin-notif-preview">
                <div className="admin-notif-preview-label">Live In-App Notification Preview</div>
                <div className="admin-notif-preview-card">
                  <span className="admin-notif-preview-icon">
                    {renderTypeIcon(notifType)}
                  </span>
                  <div>
                    <div className="admin-notif-preview-title">{title || 'Subject Headline'}</div>
                    <div className="admin-notif-preview-msg">{message || 'Message preview text will appear here...'}</div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button
                className="admin-btn admin-btn-primary"
                onClick={handleSend}
                disabled={sending}
                style={{ padding: '0.75rem 2rem' }}
              >
                <SendIcon size={16} />
                <span>
                  {sending
                    ? 'Transmitting...'
                    : `Send Alert${target === 'all' ? ' to All Users' : target === 'city' ? ` to ${city}` : ` to ${selectedUsers.length} Recipient(s)`}`}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Notification Log */
        <div className="admin-card">
          <div className="admin-card-header">
            <h3 className="admin-card-title">Recent Broadcast Log</h3>
            <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={fetchLog}>
              <RefreshIcon size={14} /> Refresh Log
            </button>
          </div>
          {logLoading ? (
            <div className="admin-loading">
              <div className="admin-spinner" />
              <span>Loading delivery logs...</span>
            </div>
          ) : (
            <div className="admin-notif-log">
              {log.map((entry, i) => (
                <div key={i} className="admin-log-entry">
                  <span className="admin-notif-preview-icon">
                    {renderTypeIcon(entry.notification?.type)}
                  </span>
                  <div className="admin-log-content">
                    <div className="admin-log-title">{entry.notification?.title}</div>
                    <div className="admin-log-msg">{entry.notification?.message}</div>
                    <div className="admin-log-meta">
                      Recipient: {entry.name} ({entry.email}) · {new Date(entry.notification?.createdAt).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  <span className={`admin-status-pill ${entry.notification?.read ? 'status-approved' : 'status-pending'}`}>
                    {entry.notification?.read ? 'Read' : 'Unread'}
                  </span>
                </div>
              ))}
              {log.length === 0 && (
                <div className="admin-empty-state">No notifications recorded in history yet.</div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
