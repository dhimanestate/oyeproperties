import React, { useState, useEffect } from 'react';
import {
  CMSIcon,
  BuildingIcon,
  TagIcon,
  SettingsIcon,
  BellIcon,
  RefreshIcon,
  CloseIcon,
  PlusIcon,
  CheckIcon
} from './AdminIcons';

const SORT_OPTIONS = ['popular', 'price_asc', 'price_desc', 'newest', 'area'];
const CITIES = ['Mumbai', 'Delhi NCR', 'Dubai', 'Goa', 'Bangalore', 'Hyderabad', 'London'];

export default function AdminContentCMS({ token, authHeaders, API_BASE }) {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [newFilterTag, setNewFilterTag] = useState('');
  const [newCity, setNewCity] = useState('');
  const [activeTab, setActiveTab] = useState('banner');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/config`, { headers: authHeaders })
      .then(r => r.json())
      .then(data => { if (data.success) setConfig(data.config); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const set = (field, value) => setConfig(prev => ({ ...prev, [field]: value }));

  const addFilterTag = () => {
    const tag = newFilterTag.trim();
    if (!tag) return;
    if (!config.customFilterTags.includes(tag)) {
      set('customFilterTags', [...config.customFilterTags, tag]);
    }
    setNewFilterTag('');
  };

  const removeFilterTag = (tag) => set('customFilterTags', config.customFilterTags.filter(t => t !== tag));

  const moveCity = (i, dir) => {
    const cities = [...config.featuredCities];
    const j = i + dir;
    if (j < 0 || j >= cities.length) return;
    [cities[i], cities[j]] = [cities[j], cities[i]];
    set('featuredCities', cities);
  };

  const removeCity = (city) => set('featuredCities', config.featuredCities.filter(c => c !== city));

  const addCity = () => {
    if (!newCity.trim()) return;
    if (!config.featuredCities.includes(newCity)) {
      set('featuredCities', [...config.featuredCities, newCity]);
    }
    setNewCity('');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { _id, __v, configKey, createdAt, updatedAt, ...updates } = config;
      const r = await fetch(`${API_BASE}/api/admin/config`, {
        method: 'PUT',
        headers: authHeaders,
        body: JSON.stringify(updates),
      });
      const data = await r.json();
      if (data.success) {
        showToast('Site configuration updated successfully');
        setConfig(data.config);
      } else {
        showToast(data.error || 'Failed to save configuration');
      }
    } catch {
      showToast('Network error while saving settings');
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="admin-loading">
        <div className="admin-spinner" />
        <span>Loading portal settings...</span>
      </div>
    );
  }

  if (!config) {
    return <div className="admin-empty-state">Unable to load portal configuration.</div>;
  }

  const TABS = [
    { id: 'banner', label: 'Hero & Content', icon: CMSIcon },
    { id: 'cities', label: 'Featured Cities', icon: BuildingIcon },
    { id: 'filters', label: 'Filter Tags', icon: TagIcon },
    { id: 'portal', label: 'Portal Config', icon: SettingsIcon },
    { id: 'reminders', label: 'Refresh Reminders', icon: BellIcon },
  ];

  return (
    <div className="admin-section">
      {toast && <div className="admin-toast">{toast}</div>}

      <div className="admin-section-header">
        <div>
          <h2 className="admin-section-title">Content & CMS Management</h2>
          <p className="admin-section-subtitle">Customize frontend copy, announcement banners, tags, and city ranking</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
          <CheckIcon size={16} />
          <span>{saving ? 'Saving...' : 'Save All Changes'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="admin-tab-group" style={{ marginBottom: '1.5rem' }}>
        {TABS.map(t => {
          const TabIcon = t.icon;
          return (
            <button
              key={t.id}
              className={`admin-tab ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              <TabIcon size={15} />
              <span>{t.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Hero Banner */}
      {activeTab === 'banner' && (
        <div className="admin-card">
          <h3 className="admin-card-title">Homepage Hero & Branding Copy</h3>

          <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
            <label className="admin-label">Hero Main Headline</label>
            <input
              className="admin-input"
              value={config.heroBannerText}
              onChange={e => set('heroBannerText', e.target.value)}
            />
          </div>
          <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
            <label className="admin-label">Hero Subtitle</label>
            <input
              className="admin-input"
              value={config.heroBannerSubtitle}
              onChange={e => set('heroBannerSubtitle', e.target.value)}
            />
          </div>
          <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
            <label className="admin-label">Brand Tagline (Used in Footer & Metadata)</label>
            <input
              className="admin-input"
              value={config.portalTagline}
              onChange={e => set('portalTagline', e.target.value)}
            />
          </div>
          <div className="admin-form-group" style={{ marginBottom: '1rem' }}>
            <label className="admin-label">Footer About Description</label>
            <textarea
              className="admin-textarea"
              rows={3}
              value={config.footerAboutText}
              onChange={e => set('footerAboutText', e.target.value)}
            />
          </div>

          {/* Site-wide Announcement Banner */}
          <div className="admin-announcement-box" style={{ marginTop: '1.5rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
              <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: 'var(--admin-text)' }}>
                Site-Wide Announcement Strip
              </h4>
              <label className="admin-toggle-label">
                <input
                  type="checkbox"
                  checked={config.announcementBannerEnabled}
                  onChange={e => set('announcementBannerEnabled', e.target.checked)}
                />
                <span className="admin-toggle-switch" />
                <span style={{ fontWeight: 600 }}>{config.announcementBannerEnabled ? 'Active' : 'Disabled'}</span>
              </label>
            </div>

            <div className="admin-form-group" style={{ marginBottom: '0.75rem' }}>
              <label className="admin-label">Announcement Banner Text</label>
              <input
                className="admin-input"
                value={config.announcementBanner}
                onChange={e => set('announcementBanner', e.target.value)}
                placeholder="e.g. New luxury penthouse listings added in Mumbai — Schedule a private viewing today"
              />
            </div>

            <div className="admin-form-group">
              <label className="admin-label">Accent Theme Color</label>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="color"
                  value={config.announcementBannerColor}
                  onChange={e => set('announcementBannerColor', e.target.value)}
                  style={{ width: '45px', height: '36px', border: '1px solid var(--admin-border)', borderRadius: '6px', cursor: 'pointer' }}
                />
                <input
                  className="admin-input"
                  value={config.announcementBannerColor}
                  onChange={e => set('announcementBannerColor', e.target.value)}
                  style={{ maxWidth: '160px' }}
                />
              </div>
            </div>

            {config.announcementBannerEnabled && config.announcementBanner && (
              <div className="admin-banner-preview" style={{ background: config.announcementBannerColor }}>
                {config.announcementBanner}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Cities */}
      {activeTab === 'cities' && (
        <div className="admin-card">
          <h3 className="admin-card-title">Featured City Ordering</h3>
          <p className="admin-meta-sub" style={{ marginBottom: '1.25rem' }}>
            Adjust the order of city pills shown in the homepage search bar and filters. Use up/down arrows to position.
          </p>

          <div className="admin-city-reorder-list">
            {config.featuredCities.map((city, i) => (
              <div key={city} className="admin-city-reorder-item">
                <div className="admin-city-reorder-controls">
                  <button
                    className="admin-icon-btn"
                    onClick={() => moveCity(i, -1)}
                    disabled={i === 0}
                    title="Move Up"
                  >
                    ▲
                  </button>
                  <button
                    className="admin-icon-btn"
                    onClick={() => moveCity(i, 1)}
                    disabled={i === config.featuredCities.length - 1}
                    title="Move Down"
                  >
                    ▼
                  </button>
                </div>
                <span className="admin-city-reorder-num">{i + 1}</span>
                <span className="admin-city-reorder-name">{city}</span>
                <button
                  className="admin-icon-btn danger"
                  onClick={() => removeCity(city)}
                  title="Remove City"
                >
                  <CloseIcon size={14} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', maxWidth: '400px' }}>
            <input
              className="admin-input"
              value={newCity}
              onChange={e => setNewCity(e.target.value)}
              placeholder="Add new city market..."
              onKeyDown={e => e.key === 'Enter' && addCity()}
            />
            <button className="admin-btn admin-btn-primary" onClick={addCity}>
              <PlusIcon size={14} /> Add City
            </button>
          </div>
        </div>
      )}

      {/* Tab: Filter Tags */}
      {activeTab === 'filters' && (
        <div className="admin-card">
          <h3 className="admin-card-title">Custom Quick Filter Tags</h3>
          <p className="admin-meta-sub" style={{ marginBottom: '1.25rem' }}>
            These chips are displayed on the catalogue page for 1-click filter matching.
          </p>

          <div className="admin-tags-wrap">
            {config.customFilterTags.map(tag => (
              <div key={tag} className="admin-filter-tag-chip">
                <span>{tag}</span>
                <button onClick={() => removeFilterTag(tag)}>
                  <CloseIcon size={12} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem', maxWidth: '400px' }}>
            <input
              className="admin-input"
              value={newFilterTag}
              onChange={e => setNewFilterTag(e.target.value)}
              placeholder="Add filter tag (e.g. Sea View, Ready to Move)..."
              onKeyDown={e => e.key === 'Enter' && addFilterTag()}
            />
            <button className="admin-btn admin-btn-primary" onClick={addFilterTag}>
              <PlusIcon size={14} /> Add Tag
            </button>
          </div>
        </div>
      )}

      {/* Tab: Portal Settings */}
      {activeTab === 'portal' && (
        <div className="admin-card">
          <h3 className="admin-card-title">Global Portal Settings</h3>

          <div className="admin-form-grid">
            <div className="admin-form-group">
              <label className="admin-label">Default Property Sorting</label>
              <select
                className="admin-select"
                value={config.defaultSortOrder}
                onChange={e => set('defaultSortOrder', e.target.value)}
              >
                {SORT_OPTIONS.map(s => <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>)}
              </select>
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Top Picks Showcase Count</label>
              <input
                className="admin-input"
                type="number"
                min={1}
                max={24}
                value={config.topPicksCount}
                onChange={e => set('topPicksCount', parseInt(e.target.value))}
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Official Support WhatsApp</label>
              <input
                className="admin-input"
                value={config.whatsappNumber}
                onChange={e => set('whatsappNumber', e.target.value)}
                placeholder="+919820014820"
              />
            </div>
            <div className="admin-form-group">
              <label className="admin-label">Instagram Handle URL</label>
              <input
                className="admin-input"
                value={config.instagramUrl}
                onChange={e => set('instagramUrl', e.target.value)}
                placeholder="https://instagram.com/oyeproperties"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Reminders */}
      {activeTab === 'reminders' && (
        <div>
          <div className="admin-card" style={{ marginBottom: '1.5rem' }}>
            <h3 className="admin-card-title">Listing Status Verification Schedule</h3>
            <div className="admin-form-group">
              <label className="admin-label">Automatic Verification Interval (Days)</label>
              <input
                className="admin-input"
                type="number"
                min={1}
                max={90}
                value={config.refreshReminderDays}
                onChange={e => set('refreshReminderDays', parseInt(e.target.value))}
                style={{ maxWidth: '180px' }}
              />
              <p className="admin-meta-sub" style={{ marginTop: '0.5rem' }}>
                Every <strong>{config.refreshReminderDays} days</strong>, the automated background scheduler will send an in-app prompt to owners to re-confirm if their property is still available or sold.
              </p>
            </div>
          </div>
          <ReminderManager authHeaders={authHeaders} API_BASE={API_BASE} />
        </div>
      )}
    </div>
  );
}

// ─── Inline Reminder Manager ──────────────────────────────────────────────────
function ReminderManager({ authHeaders, API_BASE }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchReminders = async () => {
    setLoading(true);
    try {
      const r = await fetch(`${API_BASE}/api/admin/reminders`, { headers: authHeaders });
      const d = await r.json();
      if (d.success) setData(d);
    } catch { }
    setLoading(false);
  };

  const runNow = async () => {
    setRunning(true);
    try {
      const r = await fetch(`${API_BASE}/api/admin/reminders/run`, { method: 'POST', headers: authHeaders });
      const d = await r.json();
      if (d.success) {
        showToast(`Sent reminders to ${d.count} property owner(s)`);
        fetchReminders();
      } else {
        showToast('Failed to trigger reminder task');
      }
    } catch {
      showToast('Network error during execution');
    }
    setRunning(false);
  };

  useEffect(() => { fetchReminders(); }, []);

  return (
    <div className="admin-card">
      {toast && <div className="admin-toast">{toast}</div>}
      <div className="admin-card-header">
        <div>
          <h3 className="admin-card-title">Listings Due for Availability Verification</h3>
          <p className="admin-meta-sub">
            {data?.count || 0} listings require owner confirmation
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={fetchReminders}>
            <RefreshIcon size={14} /> Refresh
          </button>
          <button className="admin-btn admin-btn-primary admin-btn-sm" onClick={runNow} disabled={running}>
            <BellIcon size={14} />
            <span>{running ? 'Processing...' : 'Trigger Reminders Now'}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="admin-loading">
          <div className="admin-spinner" />
          <span>Scanning listings database...</span>
        </div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Property Title</th>
                <th>City</th>
                <th>Listing Status</th>
                <th>Last Reminded</th>
                <th>Owner Name</th>
              </tr>
            </thead>
            <tbody>
              {(data?.properties || []).map((p, i) => (
                <tr key={p._id || i}>
                  <td className="admin-prop-title">{p.title}</td>
                  <td>{p.location?.city || '—'}</td>
                  <td>
                    <span className={`admin-status-pill ${p.listingStatus === 'available' ? 'status-approved' : 'status-pending'}`}>
                      {p.listingStatus || 'Available'}
                    </span>
                  </td>
                  <td className="admin-meta-sub">
                    {p.lastRefreshPromptSentAt
                      ? new Date(p.lastRefreshPromptSentAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })
                      : 'Never dispatched'}
                  </td>
                  <td>{p.listedBy?.name || 'Unknown'}</td>
                </tr>
              ))}
              {(!data?.properties?.length) && (
                <tr>
                  <td colSpan={5} className="admin-empty-table-cell">
                    All property listings have been verified recently. No pending reminders required.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
